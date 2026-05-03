import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Prisma } from '@prisma/client';
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
  ) { }

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
    return tournament;
  }

  async findAll(query: FindTournamentQueryDto) {
    const name = (query.name ?? '').trim();
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? this.paginationsConfig.pageSize);

    const where: Prisma.TournamentWhereInput | undefined = name
      ? {
        OR: [
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
        ],
      }
      : undefined;

    const totalCount = await (where
      ? this.prisma.tournament.count({ where })
      : this.prisma.tournament.count());
    const maximumPage = Math.max(1, Math.ceil(totalCount / limit));

    if (page > maximumPage || page < 1) {
      throw new BadRequestException('Page number is out of range');
    }

    const sortBy = query.sortBy ?? TournamentsSortBy.CREATED_AT;
    const sortOrder = query.sortOrder ?? SortOrder.DESC;
    const orderBy = this.buildTournamentOrderBy(sortBy, sortOrder);

    const tournaments = await this.prisma.tournament.findMany({
      ...(where ? { where } : {}),
      skip: Number(page - 1) * Number(limit),
      take: Number(limit),
      orderBy,
      include: {
        teams: true,
      },
    });

    return {
      data: tournaments,
      currentPage: Number(page),
      nextPage: page < maximumPage ? Number(page) + 1 : null,
      previousPage: page > 1 ? Number(page) - 1 : null,
      totalPages: Number(maximumPage),
      itemsPerPage: Number(limit),
    };
  }

  /**
   * Maps `FindTournamentQueryDto.sortBy` / `sortOrder` to Prisma `orderBy`.
   * Secondary sort by `id` keeps page order stable when primary values tie.
   */
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
      default: {
        const _exhaustive: never = sortBy;
        throw new Error(
          `Unhandled tournaments sortBy: ${_exhaustive as string}`,
        );
      }
    }
    return [primary, { id: 'asc' }];
  }

  async findOne(id: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
    });
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }
    return tournament;
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
    return this.prisma.tournament.update({
      where: { id },
      data: {
        teams: {
          connect: { id: team.id },
        },
      },
    });
  }

  async update(id: string, data: UpdateTournamentDto) {
    await this.findOne(id);
    const isTheSameName = data.name === (await this.findOne(id)).name;
    if (isTheSameName) {
      throw new BadRequestException('Tournament with this name already exists');
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
    return updatedTournament;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.tournament.delete({ where: { id } });
  }

  async getLeaderboard(tournamentId: string) {
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

    const rows = teams.map((team) => {
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

    return rows;
  }
}
