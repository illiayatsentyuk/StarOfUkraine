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
  ) { }

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

  async create(data: CreateTournamentDto, userId?: string) {
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
        minJuryPerSubmission: data.minJuryPerSubmission ?? 2,
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
        minJuryPerSubmission: data.minJuryPerSubmission,
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
    const now = new Date();

    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      include: { teams: { select: { id: true } } },
    });
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    const registrationStart = new Date(tournament.registrationStart);
    const registrationEnd = new Date(tournament.registrationEnd);
    if (now < registrationStart) {
      throw new BadRequestException('Registration has not started yet');
    }
    if (now > registrationEnd) {
      throw new BadRequestException('Registration is closed');
    }

    const teams = tournament.teams ?? [];
    if (teams.length >= tournament.maxTeams) {
      throw new BadRequestException(
        'Tournament is full — maximum teams reached',
      );
    }

    const team = await this.prisma.team.findUnique({
      where: { id: data.teamId },
      include: {
        captain: { select: { id: true } },
        members: { select: { id: true } }
      },
    });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    const memberCount = team.members.length;
    if (tournament.teamSizeMin && memberCount < tournament.teamSizeMin) {
      throw new BadRequestException(
        `Team must have at least ${tournament.teamSizeMin} members to join this tournament (currently: ${memberCount})`,
      );
    }
    if (tournament.teamSizeMax && memberCount > tournament.teamSizeMax) {
      throw new BadRequestException(
        `Team cannot have more than ${tournament.teamSizeMax} members in this tournament (currently: ${memberCount})`,
      );
    }

    const alreadyJoined = teams.some((t) => t.id === team.id);
    if (alreadyJoined) {
      throw new BadRequestException(
        'Team is already registered for this tournament',
      );
    }

    const userIds = new Set<string>();
    if (team.captain?.id) userIds.add(team.captain.id);
    team.members.forEach(m => userIds.add(m.id));

    const usersAlreadyInTournament = await this.prisma.team.findMany({
      where: {
        tournaments: { some: { id } },
        NOT: { id: team.id },
        OR: [
          { captain: { id: { in: Array.from(userIds) } } },
          { members: { some: { id: { in: Array.from(userIds) } } } }
        ]
      }
    });

    if (usersAlreadyInTournament.length > 0) {
      throw new BadRequestException(
        'One or more team members are already registered for this tournament in another team',
      );
    }

    const result = await this.prisma.tournament.update({
      where: { id },
      data: { teams: { connect: { id: team.id } } },
    });

    await Promise.all([this.bumpListVersion(), this.bumpOneVersion(id)]);

    this.logger.info(
      { tournamentId: id, teamId: data.teamId },
      'Team joined tournament',
    );
    return result;
  }

  async finishEvaluation(tournamentId: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
    });
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }
    if (tournament.evaluationFinishedAt) {
      throw new BadRequestException('Evaluation is already marked as finished');
    }

    const updated = await this.prisma.tournament.update({
      where: { id: tournamentId },
      data: { evaluationFinishedAt: new Date() },
    });

    await Promise.all([
      this.bumpListVersion(),
      this.bumpOneVersion(tournamentId),
    ]);

    this.logger.info({ tournamentId }, 'Evaluation marked as finished');
    return updated;
  }

  async findAll(query: FindTournamentQueryDto, userId?: string) {
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
        teams: {
          select: {
            id: true,
            name: true,
            captain: { select: { id: true } },
            members: { select: { id: true } }
          }
        },
      },
    });

    // Determine isJoined for each tournament and hide teams if needed
    const processedData = tournaments.map(t => {
      let isJoined = false;
      if (userId) {
        isJoined = t.teams.some(team => 
          team.captain?.id === userId || team.members.some(m => m.id === userId)
        );
      }

      const shouldHide = t.hideTeamsUntilRegistrationEnds && 
                        new Date() < new Date(t.registrationEnd);

      return {
        ...t,
        isJoined,
        teams: shouldHide ? [] : t.teams
      };
    });

    const result = buildPage(processedData, page, maximumPage, limit);

    await this.cacheManager.set(cacheKey, result, CACHE_TTL.LIST);

    this.logger.debug(
      { listVersion: listV, page: result.currentPage },
      'Tournament list loaded from database',
    );
    return result;
  }

  async findOne(id: string, userId?: string) {
    const oneV = await this.getOneVersion(id);
    const cacheKey = CacheKeys.ONE(id, oneV);

    const cached =
      await this.cacheManager.get<TournamentWithTeams>(cacheKey);

    let tournament: TournamentWithTeams | null;
    if (cached) {
      this.logger.debug(
        { tournamentId: id, oneVersion: oneV },
        'Tournament cache hit',
      );
      tournament = structuredClone(cached); // Deep copy to avoid mutating cache
    } else {
      tournament = await this.prisma.tournament.findUnique({
        where: { id },
        include: {
          teams: {
            select: {
              id: true,
              name: true,
              captain: { select: { id: true } },
              members: { select: { id: true } }
            }
          }
        }
      });
      if (!tournament) {
        throw new NotFoundException('Tournament not found');
      }
      await this.cacheManager.set(cacheKey, tournament, CACHE_TTL.ONE);
      this.logger.debug({ tournamentId: id }, 'Tournament loaded from database');
    }

    // Handle isJoined and joinedTeamId
    let isJoined = false;
    let joinedTeamId: string | null = null;
    if (userId && tournament.teams) {
      const joinedTeam = tournament.teams.find((team) =>
        team.captain?.id === userId || team.members.some((m) => m.id === userId),
      );
      if (joinedTeam) {
        isJoined = true;
        joinedTeamId = joinedTeam.id;
      }
    }

    // Handle hideTeams
    const shouldHide = tournament.hideTeamsUntilRegistrationEnds && 
                      new Date() < new Date(tournament.registrationEnd);
    
    const finalTournament = {
      ...tournament,
      isJoined,
      joinedTeamId,
      teams: shouldHide ? [] : tournament.teams
    };

    return finalTournament;
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
        evaluationFinishedAt: true,
        tasks: { select: { id: true, order: true }, orderBy: { order: 'asc' } },
      },
    });
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (!tournament.evaluationFinishedAt) {
      throw new BadRequestException(
        'Leaderboard is not available yet — evaluation has not been finalised by the admin',
      );
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
            evaluations: { select: { totalScore: true, scores: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const rows: LeaderboardRow[] = teams.map((team) => {
      const submissionsByTaskId = new Map<
        string,
        { evaluations: Array<{ totalScore: number; scores: unknown }> }
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

        const criteriaBreakdown = computeCriteriaAverages(evals);

        return { taskId, avgScore: avg, criteria: criteriaBreakdown };
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

  async getTeams(tournamentId: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { id: true },
    });
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    const teams = await this.prisma.team.findMany({
      where: { tournaments: { some: { id: tournamentId } } },
      select: {
        id: true,
        name: true,
        captainName: true,
        captainEmail: true,
        city: true,
        organization: true,
        isAcceptNewMembers: true,
        createdAt: true,
        updatedAt: true,
        members: {
          select: {
            id: true,
            email: true,
            name: true,
            nameId: true,
            image: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        captain: {
          select: {
            id: true,
            email: true,
            name: true,
            nameId: true,
            image: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        submissions: {
          where: { task: { tournamentId } },
          select: {
            evaluations: { select: { totalScore: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return teams.map((team) => ({
      ...team,
      points: team.submissions.reduce(
        (sum, sub) =>
          sum + sub.evaluations.reduce((s, e) => s + e.totalScore, 0),
        0,
      ),
    }));
  }

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

type TournamentWithTeams = Prisma.TournamentGetPayload<{
  include: {
    teams: {
      select: {
        id: true;
        name: true;
        captain: { select: { id: true } };
        members: { select: { id: true } };
      };
    };
  };
}>;

type CriterionScore = { id: string; avgPoints: number };

type LeaderboardRow = {
  team: { id: string; name: string };
  totalScore: number;
  tasks: { taskId: string; avgScore: number; criteria: CriterionScore[] }[];
};

function computeCriteriaAverages(
  evals: Array<{ scores: unknown }>,
): CriterionScore[] {
  if (evals.length === 0) return [];

  const sums = new Map<string, { total: number; count: number }>();

  for (const ev of evals) {
    const scoresObj = ev.scores as {
      rubric?: Array<{ id: string; points: number }>;
    } | null;
    const rubric = scoresObj?.rubric;
    if (!Array.isArray(rubric)) continue;

    for (const item of rubric) {
      if (typeof item.id !== 'string' || typeof item.points !== 'number')
        continue;
      const entry = sums.get(item.id) ?? { total: 0, count: 0 };
      entry.total += item.points;
      entry.count += 1;
      sums.set(item.id, entry);
    }
  }

  const result: CriterionScore[] = [];
  for (const [id, { total, count }] of sums) {
    result.push({ id, avgPoints: count > 0 ? total / count : 0 });
  }
  return result;
}

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
