import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TournamentStatus } from '@prisma/client';
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
    },
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
    it('returns a tournament by id', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue(tournamentMock);

      const result = await service.findOne('tournament-1');
      expect(result).toEqual(tournamentMock);
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

  describe('getLeaderboard', () => {
    it('computes sum of jury average scores across tasks and sorts', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue({
        id: 'tournament-1',
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
    });

    it('throws when tournament not found', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue(null);

      await expect(service.getLeaderboard('missing')).rejects.toThrow(
        new NotFoundException('Tournament not found'),
      );
    });
  });
});
