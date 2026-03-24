import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  const userMock = {
    id: 'user-1',
    email: 'user@example.com',
    password: bcrypt.hashSync('P@ssw0rd123', 10),
    role: 'USER',
    name: 'Ivan Petrenko',
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

  it('POST /auth/register returns access token', async () => {
    mockPrisma.user.create.mockResolvedValue(userMock);

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user@example.com',
        password: 'P@ssw0rd123',
        name: 'Ivan Petrenko',
      })
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
  });

  it('POST /auth/login returns access token with valid credentials', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(userMock);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'P@ssw0rd123',
      })
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
  });

  it('POST /auth/login returns 401 with invalid credentials', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'missing@example.com',
        password: 'wrong',
      })
      .expect(401);
  });

  it('POST /auth/me returns 401 without token', async () => {
    await request(app.getHttpServer()).post('/auth/me').expect(401);
  });
});
