import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { Role } from '../src/enum'
import { PrismaService } from '../src/prisma/prisma.service'
import { signE2eAccessToken } from './helpers/sign-e2e-access-token'

describe('Teams (e2e)', () => {
  let app: INestApplication

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
    tournament: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('POST /teams returns paginated response', async () => {
    mockPrisma.team.count.mockResolvedValue(1)
    mockPrisma.team.findMany.mockResolvedValue([teamMock])

    const response = await request(app.getHttpServer())
      .post('/teams/list')
      .send({ page: 1, limit: 10 })
      .expect(200)

    expect(response.body).toEqual({
      data: [teamMock],
      currentPage: 1,
      nextPage: null,
      previousPage: null,
      totalPages: 1,
      itemsPerPage: 10,
    })
  })

  it('GET /teams/:id returns team', async () => {
    mockPrisma.team.findUnique.mockResolvedValue(teamMock)

    const response = await request(app.getHttpServer())
      .get('/teams/team-1')
      .expect(200)

    expect(response.body).toEqual(teamMock)
  })

  it('POST /teams creates team', async () => {
    mockPrisma.team.findFirst.mockResolvedValue(null)
    mockPrisma.team.create.mockResolvedValue(teamMock)

    const response = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${signE2eAccessToken(Role.USER)}`)
      .send({
        name: teamMock.name,
        captainName: teamMock.captainName,
        captainEmail: teamMock.captainEmail,
        members: teamMock.members,
      })
      .expect(201)

    expect(response.body).toEqual(teamMock)
  })
})
