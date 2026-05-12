import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getLoggerToken } from 'pino-nestjs';
import paginationConfig from '../config/pagination.config';
import { Role, SortOrder, TeamsSortBy } from '../enum';
import { PrismaService } from '../prisma/prisma.service';
import { TeamService } from './team.service';

describe('TeamService', () => {
  let service: TeamService;

  const mockPrisma = {
    team: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const memberOlena = {
    id: 'user-olena',
    email: 'olena@example.com',
    name: 'Olena Kovalenko',
    nameId: 'olena-1',
    image: null,
    role: Role.USER,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const memberTaras = {
    id: 'user-taras',
    email: 'taras@example.com',
    name: 'Taras Shevchenko',
    nameId: 'taras-1',
    image: null,
    role: Role.USER,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const teamMock = {
    id: 'team-1',
    name: 'Star of Ukraine',
    captainName: 'Olena Kovalenko',
    captainEmail: 'olena@example.com',
    members: [memberOlena, memberTaras],
    captain: memberOlena,
    city: 'Kyiv',
    organization: 'UA Esports',
    telegram: '@starofukraine',
    discord: 'starofukraine#1234',
    isAcceptNewMembers: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  /** What findAll / findOne return after aggregating evaluation scores */
  const teamMockWithPoints = { ...teamMock, points: 0 };

  const createPayload = {
    name: teamMock.name,
    captainName: teamMock.captainName,
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: paginationConfig.KEY,
          useValue: { pageSize: '10' },
        },
        { provide: getLoggerToken(TeamService.name), useValue: mockPinoLogger },
      ],
    }).compile();

    service = module.get<TeamService>(TeamService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a team when name is unique (creator becomes captain + initial member)', async () => {
      mockPrisma.team.findFirst.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-olena' });
      mockPrisma.team.create.mockResolvedValue(teamMock);

      const result = await service.create(createPayload, 'olena@example.com');

      expect(result).toEqual(teamMock);
      expect(mockPrisma.team.findFirst).toHaveBeenCalledWith({
        where: { name: teamMock.name },
      });
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'olena@example.com' },
        select: { id: true },
      });
      expect(mockPrisma.team.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          captain: { connect: { email: 'olena@example.com' } },
          members: {
            connect: [{ email: 'olena@example.com' }],
          },
        }),
        include: expect.any(Object),
      });
    });

    it('throws when creator email is not a registered user', async () => {
      mockPrisma.team.findFirst.mockResolvedValue(null);
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.create(createPayload, 'olena@example.com'),
      ).rejects.toThrow(new NotFoundException('User not found'));
      expect(mockPrisma.team.create).not.toHaveBeenCalled();
    });

    it('throws when team with same name exists', async () => {
      mockPrisma.team.findFirst.mockResolvedValue(teamMock);

      await expect(
        service.create(createPayload, 'olena@example.com'),
      ).rejects.toThrow(new BadRequestException('Team already exists'));
    });
  });

  describe('findAll', () => {
    it('returns paginated data', async () => {
      mockPrisma.team.count.mockResolvedValue(11);
      mockPrisma.team.findMany.mockResolvedValue([teamMock]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        data: [teamMockWithPoints],
        currentPage: 1,
        nextPage: 2,
        previousPage: null,
        totalPages: 2,
        itemsPerPage: 10,
      });
      expect(mockPrisma.team.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: expect.any(Object),
        }),
      );
    });

    it('throws when page number is out of range', async () => {
      mockPrisma.team.count.mockResolvedValue(5);

      await expect(service.findAll({ page: 4, limit: 2 })).rejects.toThrow(
        new BadRequestException('Page number is out of range'),
      );
    });

    describe('sorting', () => {
      beforeEach(() => {
        mockPrisma.team.count.mockResolvedValue(1);
        mockPrisma.team.findMany.mockResolvedValue([teamMock]);
      });

      it('uses createdAt desc by default', async () => {
        await service.findAll({ page: 1, limit: 10 });

        expect(mockPrisma.team.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
        );
      });

      it('sorts by createdAt asc when sortBy=CREATED_AT, sortOrder=ASC', async () => {
        await service.findAll({
          page: 1,
          limit: 10,
          sortBy: TeamsSortBy.CREATED_AT,
          sortOrder: SortOrder.ASC,
        });

        expect(mockPrisma.team.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ orderBy: { createdAt: 'asc' } }),
        );
      });

      it('sorts by updatedAt desc when sortBy=UPDATED_AT, sortOrder=DESC', async () => {
        await service.findAll({
          page: 1,
          limit: 10,
          sortBy: TeamsSortBy.UPDATED_AT,
          sortOrder: SortOrder.DESC,
        });

        expect(mockPrisma.team.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ orderBy: { updatedAt: 'desc' } }),
        );
      });

      it('sorts by updatedAt asc when sortBy=UPDATED_AT, sortOrder=ASC', async () => {
        await service.findAll({
          page: 1,
          limit: 10,
          sortBy: TeamsSortBy.UPDATED_AT,
          sortOrder: SortOrder.ASC,
        });

        expect(mockPrisma.team.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ orderBy: { updatedAt: 'asc' } }),
        );
      });

      it('defaults sortOrder to desc when only sortBy is given', async () => {
        await service.findAll({
          page: 1,
          limit: 10,
          sortBy: TeamsSortBy.UPDATED_AT,
        });

        expect(mockPrisma.team.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ orderBy: { updatedAt: 'desc' } }),
        );
      });

      it('defaults sortBy to createdAt when only sortOrder is given', async () => {
        await service.findAll({
          page: 1,
          limit: 10,
          sortOrder: SortOrder.ASC,
        });

        expect(mockPrisma.team.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ orderBy: { createdAt: 'asc' } }),
        );
      });
    });
  });

  describe('findOne', () => {
    it('returns a team by id', async () => {
      mockPrisma.team.findUnique.mockResolvedValue(teamMock);

      const result = await service.findOne('team-1');
      expect(result).toEqual(teamMockWithPoints);
      expect(mockPrisma.team.findUnique).toHaveBeenCalledWith({
        where: { id: 'team-1' },
        include: expect.any(Object),
      });
    });

    it('throws when team is not found', async () => {
      mockPrisma.team.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(
        new NotFoundException('Team not found'),
      );
    });
  });

  describe('update', () => {
    const existingForUpdate = {
      id: 'team-1',
      name: 'Star of Ukraine',
      captainName: 'Olena Kovalenko',
      captainEmail: 'olena@example.com',
      members: [{ email: 'olena@example.com' }, { email: 'taras@example.com' }],
      city: 'Kyiv',
      organization: 'UA Esports',
      telegram: '@starofukraine',
      discord: 'starofukraine#1234',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('updates team when name differs from existing', async () => {
      mockPrisma.team.findUnique.mockResolvedValue(existingForUpdate);
      mockPrisma.team.findFirst.mockResolvedValue(null);
      mockPrisma.user.findMany.mockResolvedValue([{ id: '1' }, { id: '2' }]);
      mockPrisma.team.update.mockResolvedValue({
        ...teamMock,
        name: 'New Team Name',
      });

      const result = await service.update('team-1', {
        name: 'New Team Name',
      });

      expect(result.name).toBe('New Team Name');
      expect(mockPrisma.team.update).toHaveBeenCalled();
    });

    it('allows unchanged name (no duplicate-name error)', async () => {
      mockPrisma.team.findUnique.mockResolvedValue(existingForUpdate);
      mockPrisma.user.findMany.mockResolvedValue([{ id: '1' }, { id: '2' }]);
      mockPrisma.team.update.mockResolvedValue(teamMock);

      await service.update('team-1', { name: 'Star of Ukraine' });

      expect(mockPrisma.team.findFirst).not.toHaveBeenCalled();
    });

    it('throws when new name is taken by another team', async () => {
      mockPrisma.team.findUnique.mockResolvedValue(existingForUpdate);
      mockPrisma.team.findFirst.mockResolvedValue({ id: 'other-team' });

      await expect(
        service.update('team-1', { name: 'Taken Name' }),
      ).rejects.toThrow(
        new BadRequestException('Team with this name already exists'),
      );
    });
  });

  describe('remove', () => {
    it('deletes team when found', async () => {
      mockPrisma.team.findUnique.mockResolvedValue(teamMock);
      mockPrisma.team.delete.mockResolvedValue(teamMock);

      const result = await service.remove('team-1');
      expect(result).toEqual(teamMock);
      expect(mockPrisma.team.delete).toHaveBeenCalledWith({
        where: { id: 'team-1' },
        include: expect.any(Object),
      });
    });
  });

  describe('join', () => {
    it('throws when team is not accepting new members', async () => {
      mockPrisma.team.findUnique.mockResolvedValue({
        ...teamMock,
        isAcceptNewMembers: false,
      });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-new' });

      await expect(service.join('team-1', 'new@example.com')).rejects.toThrow(
        new BadRequestException('Team is not accepting new members'),
      );
    });

    it('joins a team when user is not yet a member', async () => {
      mockPrisma.team.findUnique.mockResolvedValue(teamMock);
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-new' });
      mockPrisma.team.update.mockResolvedValue(teamMock);

      await service.join('team-1', 'new@example.com');

      expect(mockPrisma.team.update).toHaveBeenCalledWith({
        where: { id: 'team-1' },
        data: {
          members: {
            connect: { email: 'new@example.com' },
          },
        },
        include: expect.any(Object),
      });
    });
  });
});
