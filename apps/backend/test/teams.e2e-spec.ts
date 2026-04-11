import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Role } from '../src/enum';
import { PrismaService } from '../src/prisma/prisma.service';
import { signE2eAccessToken } from './helpers/sign-e2e-access-token';

describe('Teams (e2e)', () => {
  let app: INestApplication;

  const dateStr = '2025-01-01T00:00:00.000Z';

  const memberOlena = {
    id: 'user-olena',
    email: 'olena@example.com',
    name: 'Olena Kovalenko',
    nameId: 'olena-1',
    image: null,
    role: Role.USER,
    createdAt: dateStr,
    updatedAt: dateStr,
  };

  const memberTaras = {
    id: 'user-taras',
    email: 'taras@example.com',
    name: 'Taras Shevchenko',
    nameId: 'taras-1',
    image: null,
    role: Role.USER,
    createdAt: dateStr,
    updatedAt: dateStr,
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
    createdAt: dateStr,
    updatedAt: dateStr,
  };

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
      findMany: jest.fn(),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /teams returns paginated response', async () => {
    mockPrisma.team.count.mockResolvedValue(1);
    mockPrisma.team.findMany.mockResolvedValue([teamMock]);

    const response = await request(app.getHttpServer())
      .post('/teams/list')
      .send({ page: 1, limit: 10 })
      .expect(200);

    expect(response.body).toEqual({
      data: [teamMock],
      currentPage: 1,
      nextPage: null,
      previousPage: null,
      totalPages: 1,
      itemsPerPage: 10,
    });
  });

  it('GET /teams/:id returns team', async () => {
    mockPrisma.team.findUnique.mockResolvedValue(teamMock);

    const response = await request(app.getHttpServer())
      .get('/teams/team-1')
      .expect(200);

    expect(response.body).toEqual(teamMock);
  });

  it('POST /teams creates team', async () => {
    mockPrisma.team.findFirst.mockResolvedValue(null);
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1' });
    mockPrisma.team.create.mockResolvedValue(teamMock);

    const response = await request(app.getHttpServer())
      .post('/teams')
      .set('Authorization', `Bearer ${signE2eAccessToken(Role.USER)}`)
      .send({
        name: teamMock.name,
        captainName: teamMock.captainName,
      })
      .expect(201);

    expect(response.body).toEqual(teamMock);
  });

  it('POST /teams/:id/join joins current user to team', async () => {
    const joiner = {
      id: 'user-joiner',
      email: 'e2e@example.com',
      name: 'Joiner',
      nameId: 'joiner-1',
      image: null,
      role: Role.USER,
      createdAt: dateStr,
      updatedAt: dateStr,
    };

    mockPrisma.team.findUnique.mockResolvedValue(teamMock);
    mockPrisma.user.findUnique.mockResolvedValue({ id: joiner.id });
    mockPrisma.team.update.mockResolvedValue({
      ...teamMock,
      members: [...teamMock.members, joiner],
    });

    const response = await request(app.getHttpServer())
      .post('/teams/team-1/join')
      .set('Authorization', `Bearer ${signE2eAccessToken(Role.USER)}`)
      .expect(201);

    expect(response.body).toMatchObject({
      id: 'team-1',
    });
    expect(response.body.members).toHaveLength(3);
  });
});
