import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import type { Cache } from 'cache-manager';
import { InjectPinoLogger, PinoLogger } from 'pino-nestjs';
import {
  CACHE_TTL,
  CacheKeys,
  hashQuery,
} from '../common/cache/cache-keys.util';
import paginationConfig from '../config/pagination.config';
import { SortOrder, TournamentsSortBy } from '../enum';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTournamentDto,
  FindTournamentQueryDto,
  JoinTournamentDto,
  UpdateTournamentDto,
} from './dto';

@Injectable()
export class TournamentService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(paginationConfig.KEY)
    private paginationsConfig: ConfigType<typeof paginationConfig>,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
    @InjectPinoLogger(TournamentService.name)
    private readonly logger: PinoLogger,
  ) {}

  // ─── Version helpers ──────────────────────────────────────────────────────

  private async getListVersion(): Promise<number> {
    return (await this.cacheManager.get<number>(CacheKeys.LIST_VERSION)) ?? 0;
  }

  private async getOneVersion(id: string): Promise<number> {
    return (
      (await this.cacheManager.get<number>(CacheKeys.ONE_VERSION(id))) ?? 0
    );
  }

  private async bumpListVersion(): Promise<void> {
    const v = await this.getListVersion();
    await this.cacheManager.set(
      CacheKeys.LIST_VERSION,
      v + 1,
      CACHE_TTL.VERSION,
    );
  }

  private async bumpOneVersion(id: string): Promise<void> {
    const v = await this.getOneVersion(id);
    await this.cacheManager.set(
      CacheKeys.ONE_VERSION(id),
      v + 1,
      CACHE_TTL.VERSION,
    );
  }

  // ─── Mutations ───────────────────────────────────────────────────────────

  async create(data: CreateTournamentDto) {
    const existingTournament = await this.prisma.tournament.findFirst({
      where: {
        name: data.name,
      },
    });
    if (existingTournament) {
      throw new BadRequestException('Tournament already exists');
    }
    const tournament = await this.prisma.tournament.create({
      data: {
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        registrationStart: data.registrationStart,
        registrationEnd: data.registrationEnd,
        maxTeams: data.maxTeams,
        rounds: data.rounds,
        teamSizeMin: data.teamSizeMin,
        teamSizeMax: data.teamSizeMax,
        status: data.status,
        hideTeamsUntilRegistrationEnds:
          data.hideTeamsUntilRegistrationEnds ?? false,
      },
    });

    await this.bumpListVersion();

    this.logger.info(
      { tournamentId: tournament.id, name: tournament.name },
      'Tournament created',
    );
    return tournament;
  }

  async update(id: string, data: UpdateTournamentDto) {
    const current = await this.findOne(id);

    if (typeof data.name === 'string' && data.name.trim().length > 0) {
      const nextName = data.name.trim();
      const currentName = (current.name ?? '').trim();

      if (nextName !== currentName) {
        const existingTournament = await this.prisma.tournament.findFirst({
          where: {
            name: nextName,
            id: { not: id },
          },
        });
        if (existingTournament) {
          throw new BadRequestException(
            'Tournament with this name already exists',
          );
        }
      }
    }
    const updatedTournament = await this.prisma.tournament.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        registrationStart: data.registrationStart,
        registrationEnd: data.registrationEnd,
        maxTeams: data.maxTeams,
        rounds: data.rounds,
        teamSizeMin: data.teamSizeMin,
        teamSizeMax: data.teamSizeMax,
        status: data.status,
        hideTeamsUntilRegistrationEnds: data.hideTeamsUntilRegistrationEnds,
      },
    });

    await Promise.all([this.bumpListVersion(), this.bumpOneVersion(id)]);

    this.logger.info({ tournamentId: id }, 'Tournament updated');
    return updatedTournament;
  }

  async remove(id: string) {
    await this.findOne(id);

    const deleted = await this.prisma.tournament.delete({ where: { id } });

    await Promise.all([this.bumpListVersion(), this.bumpOneVersion(id)]);

    this.logger.info({ tournamentId: id }, 'Tournament deleted');
    return deleted;
  }

  async joinTournament(id: string, data: JoinTournamentDto) {
    const tournament = await this.findOne(id);
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }
    const team = await this.prisma.team.findUnique({
      where: { id: data.teamId },
    });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const result = await this.prisma.tournament.update({
      where: { id },
      data: {
        teams: {
          connect: { id: team.id },
        },
      },
    });

    // findAll includes teams, so both list and single views are stale
    await Promise.all([this.bumpListVersion(), this.bumpOneVersion(id)]);

    this.logger.info(
      { tournamentId: id, teamId: data.teamId },
      'Team joined tournament',
    );
    return result;
  }

  // ─── Queries (cache-aside) ────────────────────────────────────────────────

  async findAll(query: FindTournamentQueryDto) {
    const listV = await this.getListVersion();
    const cacheKey = CacheKeys.LIST(listV, hashQuery(query));

    const cached =
      await this.cacheManager.get<ReturnType<typeof buildPage>>(cacheKey);
    if (cached) {
      this.logger.debug(
        { listVersion: listV, cacheKey },
        'Tournament list cache hit',
      );
      return cached;
    }

    const name = (query.name ?? '').trim();
    const status = query.status;
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? this.paginationsConfig.pageSize);

    const where: Prisma.TournamentWhereInput = {};
    if (name) {
      where.OR = [
        {
          name: {
            contains: name,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          id: {
            contains: name,
          },
        },
      ];
    }
    if (status) {
      where.status = status;
    }
    const whereOrUndefined = Object.keys(where).length ? where : undefined;

    const totalCount = await (whereOrUndefined
      ? this.prisma.tournament.count({ where: whereOrUndefined })
      : this.prisma.tournament.count());
    const maximumPage = Math.max(1, Math.ceil(totalCount / limit));

    if (page > maximumPage || page < 1) {
      throw new BadRequestException('Page number is out of range');
    }

    const sortBy = query.sortBy ?? TournamentsSortBy.CREATED_AT;
    const sortOrder = query.sortOrder ?? SortOrder.DESC;
    const orderBy = this.buildTournamentOrderBy(sortBy, sortOrder);

    const tournaments = await this.prisma.tournament.findMany({
      ...(whereOrUndefined ? { where: whereOrUndefined } : {}),
      skip: Number(page - 1) * Number(limit),
      take: Number(limit),
      orderBy,
      include: {
        teams: true,
      },
    });

    const result = buildPage(tournaments, page, maximumPage, limit);

    await this.cacheManager.set(cacheKey, result, CACHE_TTL.LIST);

    this.logger.debug(
      { listVersion: listV, page: result.currentPage },
      'Tournament list loaded from database',
    );
    return result;
  }

  async findOne(id: string) {
    const oneV = await this.getOneVersion(id);
    const cacheKey = CacheKeys.ONE(id, oneV);

    const cached =
      await this.cacheManager.get<
        Awaited<ReturnType<typeof this.prisma.tournament.findUnique>>
      >(cacheKey);
    if (cached) {
      this.logger.debug(
        { tournamentId: id, oneVersion: oneV },
        'Tournament cache hit',
      );
      return cached;
    }

    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
    });
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    await this.cacheManager.set(cacheKey, tournament, CACHE_TTL.ONE);

    this.logger.debug({ tournamentId: id }, 'Tournament loaded from database');
    return tournament;
  }

  async getLeaderboard(tournamentId: string) {
    const oneV = await this.getOneVersion(tournamentId);
    const cacheKey = CacheKeys.LEADERBOARD(tournamentId, oneV);

    const cached = await this.cacheManager.get<LeaderboardRow[]>(cacheKey);
    if (cached) {
      this.logger.debug(
        { tournamentId, oneVersion: oneV },
        'Tournament leaderboard cache hit',
      );
      return cached;
    }

    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        tasks: { select: { id: true, order: true }, orderBy: { order: 'asc' } },
      },
    });
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    const taskIds = tournament.tasks.map((t) => t.id);

    const teams = await this.prisma.team.findMany({
      where: { tournaments: { some: { id: tournamentId } } },
      select: {
        id: true,
        name: true,
        submissions: {
          where: taskIds.length
            ? { taskId: { in: taskIds } }
            : { task: { tournamentId } },
          select: {
            taskId: true,
            evaluations: { select: { totalScore: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const rows: LeaderboardRow[] = teams.map((team) => {
      const submissionsByTaskId = new Map<
        string,
        { evaluations: Array<{ totalScore: number }> }
      >();
      for (const s of team.submissions) {
        submissionsByTaskId.set(s.taskId, { evaluations: s.evaluations });
      }

      const tasks = taskIds.map((taskId) => {
        const submission = submissionsByTaskId.get(taskId);
        const evals = submission?.evaluations ?? [];
        const avg =
          evals.length === 0
            ? 0
            : evals.reduce((sum, e) => sum + e.totalScore, 0) / evals.length;
        return { taskId, avgScore: avg };
      });

      const totalScore = tasks.reduce((sum, t) => sum + t.avgScore, 0);

      return {
        team: { id: team.id, name: team.name },
        totalScore,
        tasks,
      };
    });

    rows.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return a.team.name.localeCompare(b.team.name, 'uk');
    });

    await this.cacheManager.set(cacheKey, rows, CACHE_TTL.LEADERBOARD);

    this.logger.debug(
      { tournamentId, teamCount: rows.length },
      'Leaderboard computed',
    );
    return rows;
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  private buildTournamentOrderBy(
    sortBy: TournamentsSortBy,
    sortOrder: SortOrder,
  ): Prisma.TournamentOrderByWithRelationInput[] {
    const dir = sortOrder === SortOrder.ASC ? 'asc' : 'desc';
    let primary: Prisma.TournamentOrderByWithRelationInput;
    switch (sortBy) {
      case TournamentsSortBy.CREATED_AT:
        primary = { createdAt: dir };
        break;
      case TournamentsSortBy.UPDATED_AT:
        primary = { updatedAt: dir };
        break;
      case TournamentsSortBy.NAME:
        primary = { name: dir };
        break;
      case TournamentsSortBy.START_DATE:
        primary = { startDate: dir };
        break;
      case TournamentsSortBy.REGISTRATION_START:
        primary = { registrationStart: dir };
        break;
      case TournamentsSortBy.REGISTRATION_END:
        primary = { registrationEnd: dir };
        break;
      case TournamentsSortBy.MAX_TEAMS:
        primary = { maxTeams: dir };
        break;
      case TournamentsSortBy.ROUNDS:
        primary = { rounds: dir };
        break;
      case TournamentsSortBy.TEAM_SIZE_MIN:
        primary = { teamSizeMin: dir };
        break;
      case TournamentsSortBy.TEAM_SIZE_MAX:
        primary = { teamSizeMax: dir };
        break;
      case TournamentsSortBy.STATUS:
        primary = { status: dir };
        break;
      default: {
        const _exhaustive: never = sortBy;
        throw new Error(
          `Unhandled tournaments sortBy: ${_exhaustive as string}`,
        );
      }
    }
    return [primary, { id: 'asc' }];
  }
}

// ─── Local types ─────────────────────────────────────────────────────────────

type LeaderboardRow = {
  team: { id: string; name: string };
  totalScore: number;
  tasks: { taskId: string; avgScore: number }[];
};

function buildPage(
  tournaments: unknown[],
  page: number,
  maximumPage: number,
  limit: number,
) {
  return {
    data: tournaments,
    currentPage: Number(page),
    nextPage: page < maximumPage ? Number(page) + 1 : null,
    previousPage: page > 1 ? Number(page) - 1 : null,
    totalPages: Number(maximumPage),
    itemsPerPage: Number(limit),
  };
}
