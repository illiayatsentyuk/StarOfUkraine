import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, TournamentStatus } from '@prisma/client';
import { getLoggerToken } from 'pino-nestjs';
import {
  CACHE_TTL,
  CacheKeys,
  hashQuery,
} from '../common/cache/cache-keys.util';
import paginationConfig from '../config/pagination.config';
import { SortOrder, TournamentsSortBy } from '../enum';
import { PrismaService } from '../prisma/prisma.service';
import { TournamentService } from './tournament.service';

describe('TournamentService', () => {
  let service: TournamentService;

  const mockPrisma = {
    tournament: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    team: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockCache = {
    get: jest.fn().mockResolvedValue(undefined),
    set: jest.fn().mockResolvedValue(undefined),
  };

  const mockPinoLogger = {
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    setContext: jest.fn(),
    assign: jest.fn(),
  };

  const tournamentMock = {
    id: 'tournament-1',
    name: 'Star of Ukraine Cup 2026',
    description: 'Open tournament for teams across Ukraine.',
    startDate: new Date('2026-04-01T12:00:00.000Z'),
    registrationStart: new Date('2026-03-20T00:00:00.000Z'),
    registrationEnd: new Date('2026-03-30T23:59:59.000Z'),
    maxTeams: 64,
    rounds: 6,
    teamSizeMin: 5,
    teamSizeMax: 7,
    status: TournamentStatus.DRAFT,
    hideTeamsUntilRegistrationEnds: true,
  };

  beforeEach(async () => {
    mockPrisma.tournament.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.tournament.findFirst.mockResolvedValue(null);
    mockCache.get.mockReset();
    mockCache.get.mockResolvedValue(undefined);
    mockCache.set.mockReset();
    mockCache.set.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TournamentService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: paginationConfig.KEY,
          useValue: { pageSize: '10' },
        },
        { provide: 'CACHE_MANAGER', useValue: mockCache },
        {
          provide: getLoggerToken(TournamentService.name),
          useValue: mockPinoLogger,
        },
      ],
    }).compile();

    service = module.get<TournamentService>(TournamentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a tournament when name is unique', async () => {
      mockPrisma.tournament.findFirst.mockResolvedValue(null);
      mockPrisma.tournament.create.mockResolvedValue(tournamentMock);

      const result = await service.create({
        name: tournamentMock.name,
        description: tournamentMock.description,
        startDate: tournamentMock.startDate,
        registrationStart: tournamentMock.registrationStart,
        registrationEnd: tournamentMock.registrationEnd,
        maxTeams: tournamentMock.maxTeams,
        rounds: tournamentMock.rounds,
        teamSizeMin: tournamentMock.teamSizeMin,
        teamSizeMax: tournamentMock.teamSizeMax,
        status: tournamentMock.status,
      });

      expect(result).toEqual(tournamentMock);
      expect(mockPrisma.tournament.findFirst).toHaveBeenCalledWith({
        where: { name: tournamentMock.name },
      });
      expect(mockCache.set).toHaveBeenCalledWith(
        CacheKeys.LIST_VERSION,
        1,
        CACHE_TTL.VERSION,
      );
    });

    it('throws when tournament with same name exists', async () => {
      mockPrisma.tournament.findFirst.mockResolvedValue(tournamentMock);

      await expect(
        service.create({
          name: tournamentMock.name,
          startDate: tournamentMock.startDate,
          registrationStart: tournamentMock.registrationStart,
          registrationEnd: tournamentMock.registrationEnd,
          maxTeams: tournamentMock.maxTeams,
          rounds: tournamentMock.rounds,
          teamSizeMin: tournamentMock.teamSizeMin,
          teamSizeMax: tournamentMock.teamSizeMax,
        }),
      ).rejects.toThrow(new BadRequestException('Tournament already exists'));
    });
  });

  describe('findAll', () => {
    it('returns cached page without hitting the database', async () => {
      const query = { page: 1, limit: 10 };
      const cached = {
        data: [tournamentMock],
        currentPage: 1,
        nextPage: null,
        previousPage: null,
        totalPages: 1,
        itemsPerPage: 10,
      };
      mockCache.get.mockImplementation(async (key: string) =>
        key === CacheKeys.LIST(0, hashQuery(query)) ? cached : undefined,
      );

      const result = await service.findAll(query);

      expect(result).toEqual(cached);
      expect(mockPrisma.tournament.count).not.toHaveBeenCalled();
      expect(mockPrisma.tournament.findMany).not.toHaveBeenCalled();
    });

    it('returns paginated data', async () => {
      mockPrisma.tournament.count.mockResolvedValue(13);
      mockPrisma.tournament.findMany.mockResolvedValue([tournamentMock]);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(result).toEqual({
        data: [tournamentMock],
        currentPage: 2,
        nextPage: null,
        previousPage: 1,
        totalPages: 2,
        itemsPerPage: 10,
      });
      expect(mockPrisma.tournament.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        include: { teams: true },
      });
      expect(mockCache.set).toHaveBeenCalledWith(
        CacheKeys.LIST(0, hashQuery({ page: 2, limit: 10 })),
        expect.objectContaining({ data: [tournamentMock] }),
        CACHE_TTL.LIST,
      );
    });

    it('applies name filter to count and findMany', async () => {
      mockPrisma.tournament.count.mockResolvedValue(1);
      mockPrisma.tournament.findMany.mockResolvedValue([tournamentMock]);

      await service.findAll({ page: 1, limit: 10, name: '  Cup  ' });

      const expectedWhere = {
        OR: [
          {
            name: { contains: 'Cup', mode: Prisma.QueryMode.insensitive },
          },
          { id: { contains: 'Cup' } },
        ],
      };
      expect(mockPrisma.tournament.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
      expect(mockPrisma.tournament.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expectedWhere }),
      );
    });

    it('applies status filter to count and findMany', async () => {
      mockPrisma.tournament.count.mockResolvedValue(1);
      mockPrisma.tournament.findMany.mockResolvedValue([tournamentMock]);

      await service.findAll({
        page: 1,
        limit: 10,
        status: TournamentStatus.ONGOING,
      });

      const expectedWhere = { status: TournamentStatus.ONGOING };
      expect(mockPrisma.tournament.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
      expect(mockPrisma.tournament.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expectedWhere }),
      );
    });

    it('throws when page number is out of range', async () => {
      mockPrisma.tournament.count.mockResolvedValue(5);

      await expect(
        service.findAll({
          page: 4,
          limit: 2,
        }),
      ).rejects.toThrow(new BadRequestException('Page number is out of range'));
    });

    describe('sorting', () => {
      beforeEach(() => {
        mockPrisma.tournament.count.mockResolvedValue(1);
        mockPrisma.tournament.findMany.mockResolvedValue([tournamentMock]);
      });

      it('uses createdAt desc by default', async () => {
        await service.findAll({ page: 1, limit: 10 });

        expect(mockPrisma.tournament.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
          }),
        );
      });

      it('sorts by createdAt asc when sortBy=CREATED_AT, sortOrder=ASC', async () => {
        await service.findAll({
          page: 1,
          limit: 10,
          sortBy: TournamentsSortBy.CREATED_AT,
          sortOrder: SortOrder.ASC,
        });

        expect(mockPrisma.tournament.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          }),
        );
      });

      it('sorts by updatedAt desc when sortBy=UPDATED_AT, sortOrder=DESC', async () => {
        await service.findAll({
          page: 1,
          limit: 10,
          sortBy: TournamentsSortBy.UPDATED_AT,
          sortOrder: SortOrder.DESC,
        });

        expect(mockPrisma.tournament.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
          }),
        );
      });

      it('sorts by updatedAt asc when sortBy=UPDATED_AT, sortOrder=ASC', async () => {
        await service.findAll({
          page: 1,
          limit: 10,
          sortBy: TournamentsSortBy.UPDATED_AT,
          sortOrder: SortOrder.ASC,
        });

        expect(mockPrisma.tournament.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: [{ updatedAt: 'asc' }, { id: 'asc' }],
          }),
        );
      });

      it('defaults sortOrder to desc when only sortBy is given', async () => {
        await service.findAll({
          page: 1,
          limit: 10,
          sortBy: TournamentsSortBy.UPDATED_AT,
        });

        expect(mockPrisma.tournament.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
          }),
        );
      });

      it('defaults sortBy to createdAt when only sortOrder is given', async () => {
        await service.findAll({
          page: 1,
          limit: 10,
          sortOrder: SortOrder.ASC,
        });

        expect(mockPrisma.tournament.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
          }),
        );
      });

      it('sorts by status asc when sortBy=STATUS, sortOrder=ASC', async () => {
        await service.findAll({
          page: 1,
          limit: 10,
          sortBy: TournamentsSortBy.STATUS,
          sortOrder: SortOrder.ASC,
        });

        expect(mockPrisma.tournament.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: [{ status: 'asc' }, { id: 'asc' }],
          }),
        );
      });

      it('sorts by status desc when sortBy=STATUS, sortOrder=DESC', async () => {
        await service.findAll({
          page: 1,
          limit: 10,
          sortBy: TournamentsSortBy.STATUS,
          sortOrder: SortOrder.DESC,
        });

        expect(mockPrisma.tournament.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: [{ status: 'desc' }, { id: 'asc' }],
          }),
        );
      });
    });
  });

  describe('findOne', () => {
    it('returns a tournament from cache when present', async () => {
      mockCache.get.mockImplementation(async (key: string) =>
        key === CacheKeys.ONE('tournament-1', 0) ? tournamentMock : undefined,
      );

      const result = await service.findOne('tournament-1');

      expect(result).toEqual(tournamentMock);
      expect(mockPrisma.tournament.findUnique).not.toHaveBeenCalled();
    });

    it('returns a tournament by id', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue(tournamentMock);

      const result = await service.findOne('tournament-1');
      expect(result).toEqual(tournamentMock);
      expect(mockCache.set).toHaveBeenCalledWith(
        CacheKeys.ONE('tournament-1', 0),
        tournamentMock,
        CACHE_TTL.ONE,
      );
    });

    it('throws when tournament is not found', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(
        new NotFoundException('Tournament not found'),
      );
    });
  });

  describe('update', () => {
    it('updates tournament when name differs from existing', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue(tournamentMock);
      mockPrisma.tournament.findFirst.mockResolvedValue(null);
      mockPrisma.tournament.update.mockResolvedValue({
        ...tournamentMock,
        name: 'Updated Tournament Name',
      });

      const result = await service.update('tournament-1', {
        name: 'Updated Tournament Name',
      });

      expect(result.name).toBe('Updated Tournament Name');
      expect(mockPrisma.tournament.update).toHaveBeenCalled();
    });

    it('does not throw when name is unchanged', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue(tournamentMock);
      mockPrisma.tournament.update.mockResolvedValue(tournamentMock);

      await expect(
        service.update('tournament-1', { name: tournamentMock.name }),
      ).resolves.toEqual(tournamentMock);
    });

    it('throws when new name is taken by another tournament', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue(tournamentMock);
      mockPrisma.tournament.findFirst.mockResolvedValue({ id: 'tournament-2' });

      await expect(
        service.update('tournament-1', { name: 'Taken Name' }),
      ).rejects.toThrow(
        new BadRequestException('Tournament with this name already exists'),
      );
    });
  });

  describe('remove', () => {
    it('deletes tournament when found', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue(tournamentMock);
      mockPrisma.tournament.delete.mockResolvedValue(tournamentMock);

      const result = await service.remove('tournament-1');
      expect(result).toEqual(tournamentMock);
      expect(mockPrisma.tournament.delete).toHaveBeenCalledWith({
        where: { id: 'tournament-1' },
      });
    });
  });

  describe('joinTournament', () => {
    const now = new Date();
    const openTournament = {
      ...tournamentMock,
      registrationStart: new Date(now.getTime() - 60_000),
      registrationEnd: new Date(now.getTime() + 60_000),
      maxTeams: 64,
      teamSizeMin: 1,
      teamSizeMax: 10,
      teams: [],
    };

    it('connects team and bumps list and tournament cache versions', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue(openTournament);
      mockPrisma.team.findUnique.mockResolvedValue({
        id: 'team-1',
        members: [{ id: 'user-1' }, { id: 'user-2' }],
      });
      const updated = { ...openTournament, teams: [{ id: 'team-1' }] };
      mockPrisma.tournament.update.mockResolvedValue(updated);

      const result = await service.joinTournament('tournament-1', {
        teamId: 'team-1',
      });

      expect(result).toEqual(updated);
      expect(mockPrisma.tournament.update).toHaveBeenCalledWith({
        where: { id: 'tournament-1' },
        data: { teams: { connect: { id: 'team-1' } } },
      });
      expect(mockCache.set).toHaveBeenCalledWith(
        CacheKeys.LIST_VERSION,
        1,
        CACHE_TTL.VERSION,
      );
      expect(mockCache.set).toHaveBeenCalledWith(
        CacheKeys.ONE_VERSION('tournament-1'),
        1,
        CACHE_TTL.VERSION,
      );
    });

    it('throws when registration is not open yet', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue({
        ...openTournament,
        registrationStart: new Date(now.getTime() + 60_000),
        registrationEnd: new Date(now.getTime() + 120_000),
      });

      await expect(
        service.joinTournament('tournament-1', { teamId: 'team-1' }),
      ).rejects.toThrow(
        new BadRequestException('Registration has not started yet'),
      );
    });

    it('throws when registration is closed', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue({
        ...openTournament,
        registrationStart: new Date(now.getTime() - 120_000),
        registrationEnd: new Date(now.getTime() - 60_000),
      });

      await expect(
        service.joinTournament('tournament-1', { teamId: 'team-1' }),
      ).rejects.toThrow(new BadRequestException('Registration is closed'));
    });

    it('throws when tournament is full', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue({
        ...openTournament,
        maxTeams: 1,
        teams: [{ id: 'existing-team' }],
      });

      await expect(
        service.joinTournament('tournament-1', { teamId: 'team-1' }),
      ).rejects.toThrow(
        new BadRequestException('Tournament is full — maximum teams reached'),
      );
    });

    it('throws when team is not found', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue(openTournament);
      mockPrisma.team.findUnique.mockResolvedValue(null);

      await expect(
        service.joinTournament('tournament-1', { teamId: 'missing' }),
      ).rejects.toThrow(new NotFoundException('Team not found'));
    });

    it('throws when team is already registered', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue({
        ...openTournament,
        teams: [{ id: 'team-1' }],
      });
      mockPrisma.team.findUnique.mockResolvedValue({
        id: 'team-1',
        members: [{ id: 'user-1' }, { id: 'user-2' }],
      });

      await expect(
        service.joinTournament('tournament-1', { teamId: 'team-1' }),
      ).rejects.toThrow(
        new BadRequestException(
          'Team is already registered for this tournament',
        ),
      );
    });
  });

  describe('getLeaderboard', () => {
    it('returns cached leaderboard when present', async () => {
      const cached = [
        {
          team: { id: 'team-a', name: 'Alpha' },
          totalScore: 10,
          tasks: [{ taskId: 'task-1', avgScore: 10 }],
        },
      ];
      mockCache.get.mockImplementation(async (key: string) =>
        key === CacheKeys.LEADERBOARD('tournament-1', 0) ? cached : undefined,
      );

      const result = await service.getLeaderboard('tournament-1');

      expect(result).toEqual(cached);
      expect(mockPrisma.tournament.findUnique).not.toHaveBeenCalled();
    });

    it('computes sum of jury average scores across tasks and sorts', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue({
        id: 'tournament-1',
        evaluationFinishedAt: new Date(),
        tasks: [
          { id: 'task-1', order: 1 },
          { id: 'task-2', order: 2 },
        ],
      });

      mockPrisma.team.findMany.mockResolvedValue([
        {
          id: 'team-a',
          name: 'Alpha',
          submissions: [
            {
              taskId: 'task-1',
              evaluations: [{ totalScore: 10 }, { totalScore: 20 }],
            },
            { taskId: 'task-2', evaluations: [] },
          ],
        },
        {
          id: 'team-b',
          name: 'Beta',
          submissions: [
            { taskId: 'task-1', evaluations: [{ totalScore: 30 }] },
            {
              taskId: 'task-2',
              evaluations: [{ totalScore: 10 }, { totalScore: 10 }],
            },
          ],
        },
      ]);

      const result = await service.getLeaderboard('tournament-1');

      expect(result).toHaveLength(2);
      expect(result[0].team.id).toBe('team-b');
      expect(result[0].totalScore).toBe(40);
      expect(result[0].tasks).toEqual([
        { taskId: 'task-1', avgScore: 30 },
        { taskId: 'task-2', avgScore: 10 },
      ]);

      expect(result[1].team.id).toBe('team-a');
      expect(result[1].totalScore).toBe(15);
      expect(result[1].tasks).toEqual([
        { taskId: 'task-1', avgScore: 15 },
        { taskId: 'task-2', avgScore: 0 },
      ]);
      expect(mockCache.set).toHaveBeenCalledWith(
        CacheKeys.LEADERBOARD('tournament-1', 0),
        result,
        CACHE_TTL.LEADERBOARD,
      );
    });

    it('throws when evaluation not yet finalised', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue({
        id: 'tournament-1',
        evaluationFinishedAt: null,
        tasks: [],
      });

      await expect(service.getLeaderboard('tournament-1')).rejects.toThrow(
        new BadRequestException(
          'Leaderboard is not available yet — evaluation has not been finalised by the admin',
        ),
      );
    });

    it('throws when tournament not found', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue(null);

      await expect(service.getLeaderboard('missing')).rejects.toThrow(
        new NotFoundException('Tournament not found'),
      );
    });
  });

  describe('finishEvaluation', () => {
    it('sets evaluationFinishedAt and invalidates list/one cache keys', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue({
        ...tournamentMock,
        evaluationFinishedAt: null,
      });
      const updated = {
        ...tournamentMock,
        evaluationFinishedAt: new Date('2026-05-01T12:00:00.000Z'),
      };
      mockPrisma.tournament.update.mockResolvedValue(updated);

      const result = await service.finishEvaluation('tournament-1');

      expect(result.evaluationFinishedAt).toBeDefined();
      expect(mockPrisma.tournament.update).toHaveBeenCalledWith({
        where: { id: 'tournament-1' },
        data: { evaluationFinishedAt: expect.any(Date) },
      });
      expect(mockCache.set).toHaveBeenCalled();
      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        { tournamentId: 'tournament-1' },
        'Evaluation marked as finished',
      );
    });

    it('throws when tournament not found', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue(null);

      await expect(service.finishEvaluation('missing')).rejects.toThrow(
        new NotFoundException('Tournament not found'),
      );
    });

    it('throws when evaluation already finished', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue({
        ...tournamentMock,
        evaluationFinishedAt: new Date('2026-04-01T00:00:00.000Z'),
      });

      await expect(service.finishEvaluation('tournament-1')).rejects.toThrow(
        new BadRequestException('Evaluation is already marked as finished'),
      );
    });
  });
});
