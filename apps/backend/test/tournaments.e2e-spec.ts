import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TournamentStatus } from '@prisma/client';
import type { Cache } from 'cache-manager';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Role } from '../src/enum';
import { PrismaService } from '../src/prisma/prisma.service';
import { signE2eAccessToken } from './helpers/sign-e2e-access-token';

describe('Tournaments (e2e)', () => {
  let app: INestApplication;

  const tournamentMock = {
    id: 'tournament-1',
    name: 'Star of Ukraine Cup 2026',
    description: 'Open tournament for teams across Ukraine.',
    startDate: '2026-04-01T12:00:00.000Z',
    registrationStart: '2026-03-20T00:00:00.000Z',
    registrationEnd: '2026-03-30T23:59:59.000Z',
    maxTeams: 64,
    rounds: 6,
    teamSizeMin: 5,
    teamSizeMax: 7,
    status: TournamentStatus.DRAFT,
    hideTeamsUntilRegistrationEnds: true,
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
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
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

  afterEach(async () => {
    jest.clearAllMocks();
    const cache = app.get<Cache>(CACHE_MANAGER);
    await cache.del('tournaments');
  });

  it('GET /tournaments/list returns paginated response', async () => {
    mockPrisma.tournament.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.tournament.count.mockResolvedValue(1);
    mockPrisma.tournament.findMany.mockResolvedValue([tournamentMock]);

    const response = await request(app.getHttpServer())
      .get('/tournaments/list')
      .query({ page: 1, limit: 10 })
      .expect(200);

    expect(mockPrisma.tournament.count).toHaveBeenCalledWith();
    expect(mockPrisma.tournament.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
        include: { teams: true },
      }),
    );
    expect(mockPrisma.tournament.findMany.mock.calls[0][0]).not.toHaveProperty(
      'where',
    );

    expect(response.body).toEqual({
      data: [tournamentMock],
      currentPage: 1,
      nextPage: null,
      previousPage: null,
      totalPages: 1,
      itemsPerPage: 10,
    });
  });

  it('GET /tournaments/list supports filtering by status', async () => {
    mockPrisma.tournament.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.tournament.count.mockResolvedValue(1);
    mockPrisma.tournament.findMany.mockResolvedValue([tournamentMock]);

    await request(app.getHttpServer())
      .get('/tournaments/list')
      .query({ page: 1, limit: 10, status: TournamentStatus.DRAFT })
      .expect(200);

    expect(mockPrisma.tournament.count).toHaveBeenCalledWith({
      where: { status: TournamentStatus.DRAFT },
    });
    expect(mockPrisma.tournament.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: TournamentStatus.DRAFT } }),
    );
  });

  it('GET /tournaments/:id returns tournament', async () => {
    mockPrisma.tournament.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.tournament.findUnique.mockResolvedValue(tournamentMock);

    const response = await request(app.getHttpServer())
      .get('/tournaments/tournament-1')
      .expect(200);

    expect(response.body).toEqual(tournamentMock);
  });

  it('POST /tournaments creates tournament', async () => {
    mockPrisma.tournament.findFirst.mockResolvedValue(null);
    mockPrisma.tournament.create.mockResolvedValue(tournamentMock);

    const response = await request(app.getHttpServer())
      .post('/tournaments')
      .set('Authorization', `Bearer ${signE2eAccessToken(Role.ADMIN)}`)
      .send({
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
      })
      .expect(201);

    expect(response.body).toEqual(tournamentMock);
  });

  it('PATCH /tournaments/join/:id connects team to tournament', async () => {
    mockPrisma.tournament.findUnique.mockResolvedValue(tournamentMock);
    mockPrisma.team.findUnique.mockResolvedValue({ id: 'team-1' });
    mockPrisma.tournament.update.mockResolvedValue(tournamentMock);

    const response = await request(app.getHttpServer())
      .patch('/tournaments/join/tournament-1')
      .set('Authorization', `Bearer ${signE2eAccessToken(Role.USER)}`)
      .send({ teamId: 'team-1' })
      .expect(200);

    expect(response.body).toEqual(tournamentMock);
  });
});
