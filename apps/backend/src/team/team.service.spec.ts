import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import paginationConfig from '../config/pagination.config'
import { SortBy, SortOrder } from '../enum'
import { PrismaService } from '../prisma/prisma.service'
import { TeamService } from './team.service'

describe('TeamService', () => {
  let service: TeamService

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
  }

  const teamMock = {
    id: 'team-1',
    name: 'Star of Ukraine',
    captainName: 'Olena Kovalenko',
    captainEmail: 'olena@example.com',
    members: ['Olena Kovalenko', 'Taras Shevchenko'],
    city: 'Kyiv',
    organization: 'UA Esports',
    telegram: '@starofukraine',
    discord: 'starofukraine#1234',
  }

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
      ],
    }).compile()

    service = module.get<TeamService>(TeamService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('creates a team when name is unique', async () => {
      mockPrisma.team.findFirst.mockResolvedValue(null)
      mockPrisma.team.create.mockResolvedValue(teamMock)

      const result = await service.create({
        name: teamMock.name,
        captainName: teamMock.captainName,
        captainEmail: teamMock.captainEmail,
        members: teamMock.members,
      })

      expect(result).toEqual(teamMock)
      expect(mockPrisma.team.findFirst).toHaveBeenCalledWith({
        where: { name: teamMock.name },
      })
    })

    it('throws when team with same name exists', async () => {
      mockPrisma.team.findFirst.mockResolvedValue(teamMock)

      await expect(
        service.create({
          name: teamMock.name,
          captainName: teamMock.captainName,
          captainEmail: teamMock.captainEmail,
          members: teamMock.members,
        }),
      ).rejects.toThrow(new BadRequestException('Team already exists'))
    })
  })

  describe('findAll', () => {
    it('returns paginated data', async () => {
      mockPrisma.team.count.mockResolvedValue(11)
      mockPrisma.team.findMany.mockResolvedValue([teamMock])

      const result = await service.findAll({ page: 1, limit: 10 })

      expect(result).toEqual({
        data: [teamMock],
        currentPage: 1,
        nextPage: 2,
        previousPage: null,
        totalPages: 2,
        itemsPerPage: 10,
      })
      expect(mockPrisma.team.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      })
    })

    it('throws when page number is out of range', async () => {
      mockPrisma.team.count.mockResolvedValue(5)

      await expect(service.findAll({ page: 4, limit: 2 })).rejects.toThrow(
        new BadRequestException('Page number is out of range'),
      )
    })

    describe('sorting', () => {
      beforeEach(() => {
        mockPrisma.team.count.mockResolvedValue(1)
        mockPrisma.team.findMany.mockResolvedValue([teamMock])
      })

      it('uses createdAt desc by default', async () => {
        await service.findAll({ page: 1, limit: 10 })

        expect(mockPrisma.team.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
        )
      })

      it('sorts by createdAt asc when sortBy=CREATED_AT, sortOrder=ASC', async () => {
        await service.findAll({
          page: 1,
          limit: 10,
          sortBy: SortBy.CREATED_AT,
          sortOrder: SortOrder.ASC,
        })

        expect(mockPrisma.team.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ orderBy: { createdAt: 'asc' } }),
        )
      })

      it('sorts by updatedAt desc when sortBy=UPDATED_AT, sortOrder=DESC', async () => {
        await service.findAll({
          page: 1,
          limit: 10,
          sortBy: SortBy.UPDATED_AT,
          sortOrder: SortOrder.DESC,
        })

        expect(mockPrisma.team.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ orderBy: { updatedAt: 'desc' } }),
        )
      })

      it('sorts by updatedAt asc when sortBy=UPDATED_AT, sortOrder=ASC', async () => {
        await service.findAll({
          page: 1,
          limit: 10,
          sortBy: SortBy.UPDATED_AT,
          sortOrder: SortOrder.ASC,
        })

        expect(mockPrisma.team.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ orderBy: { updatedAt: 'asc' } }),
        )
      })

      it('defaults sortOrder to desc when only sortBy is given', async () => {
        await service.findAll({
          page: 1,
          limit: 10,
          sortBy: SortBy.UPDATED_AT,
        })

        expect(mockPrisma.team.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ orderBy: { updatedAt: 'desc' } }),
        )
      })

      it('defaults sortBy to createdAt when only sortOrder is given', async () => {
        await service.findAll({
          page: 1,
          limit: 10,
          sortOrder: SortOrder.ASC,
        })

        expect(mockPrisma.team.findMany).toHaveBeenCalledWith(
          expect.objectContaining({ orderBy: { createdAt: 'asc' } }),
        )
      })
    })
  })

  describe('findOne', () => {
    it('returns a team by id', async () => {
      mockPrisma.team.findUnique.mockResolvedValue(teamMock)

      const result = await service.findOne('team-1')
      expect(result).toEqual(teamMock)
    })

    it('throws when team is not found', async () => {
      mockPrisma.team.findUnique.mockResolvedValue(null)

      await expect(service.findOne('missing-id')).rejects.toThrow(
        new NotFoundException('Team not found'),
      )
    })
  })

  describe('update', () => {
    it('updates team when name differs from existing', async () => {
      mockPrisma.team.findUnique.mockResolvedValue(teamMock)
      mockPrisma.team.update.mockResolvedValue({
        ...teamMock,
        name: 'New Team Name',
      })

      const result = await service.update('team-1', {
        name: 'New Team Name',
      })

      expect(result.name).toBe('New Team Name')
      expect(mockPrisma.team.update).toHaveBeenCalled()
    })

    it('throws when new name matches current name', async () => {
      mockPrisma.team.findUnique.mockResolvedValue(teamMock)

      await expect(
        service.update('team-1', { name: teamMock.name }),
      ).rejects.toThrow(
        new BadRequestException('Team with this name already exists'),
      )
    })
  })

  describe('remove', () => {
    it('deletes team when found', async () => {
      mockPrisma.team.findUnique.mockResolvedValue(teamMock)
      mockPrisma.team.delete.mockResolvedValue(teamMock)

      const result = await service.remove('team-1')
      expect(result).toEqual(teamMock)
      expect(mockPrisma.team.delete).toHaveBeenCalledWith({
        where: { id: 'team-1' },
      })
    })
  })
})
