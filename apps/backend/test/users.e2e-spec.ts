import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Role } from '../src/enum';
import { PrismaService } from '../src/prisma/prisma.service';
import { signE2eAccessToken } from './helpers/sign-e2e-access-token';

describe('Users (e2e)', () => {
  let app: INestApplication;

  const userMock = {
    id: 'user-1',
    email: 'olena@example.com',
    name: 'Olena Kovalenko',
    nameId: 'olena-1',
    image: null,
    role: Role.USER,
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
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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

  it('GET /users/search returns users', async () => {
    mockPrisma.user.findMany.mockResolvedValue([userMock]);

    const response = await request(app.getHttpServer())
      .get('/users/search')
      .query({ query: 'olena' })
      .set('Authorization', `Bearer ${signE2eAccessToken(Role.USER)}`)
      .expect(200);

    expect(response.body).toEqual([userMock]);
  });
});

