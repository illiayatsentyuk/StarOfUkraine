import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  const getSetCookieHeader = (response: request.Response): string[] => {
    const header = response.headers['set-cookie'] as string[] | string | undefined;
    if (!header) return [];
    return Array.isArray(header) ? header : [header];
  };

  const userMock = {
    id: 'user-1',
    email: 'user@example.com',
    hash: bcrypt.hashSync('P@ssw0rd123', 10),
    role: 'USER',
    name: 'Ivan Petrenko',
    hashedRt: null,
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
    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /auth/register sets HttpOnly cookies', async () => {
    mockPrisma.user.create.mockResolvedValue(userMock);
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.update.mockResolvedValue({ ...userMock, hashedRt: 'hashed-rt' });

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user@example.com',
        password: 'P@ssw0rd123',
        name: 'Ivan Petrenko',
      })
      .expect(201);

    expect(response.body).toEqual({ ok: true });
    const setCookie = getSetCookieHeader(response);
    expect(setCookie).toBeDefined();
    expect(setCookie.join(';')).toContain('access_token=');
    expect(setCookie.join(';')).toContain('HttpOnly');
    expect(setCookie.join(';')).toContain('refresh_token=');
  });

  it('POST /auth/login sets HttpOnly cookies with valid credentials', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(userMock);
    mockPrisma.user.update.mockResolvedValue({ ...userMock, hashedRt: 'hashed-rt' });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'P@ssw0rd123',
      })
      .expect(201);

    expect(response.body).toEqual({ ok: true });
    const setCookie = getSetCookieHeader(response);
    expect(setCookie).toBeDefined();
    expect(setCookie.join(';')).toContain('access_token=');
    expect(setCookie.join(';')).toContain('HttpOnly');
    expect(setCookie.join(';')).toContain('refresh_token=');
  });

  it('POST /auth/login returns 404 with missing user', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'missing@example.com',
        password: 'wrong',
      })
      .expect(404);
  });

  it('POST /auth/me returns 401 without token', async () => {
    await request(app.getHttpServer()).post('/auth/me').expect(401);
  });

  it('POST /auth/me returns 200 with access_token cookie', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(userMock);
    mockPrisma.user.update.mockResolvedValue({ ...userMock, hashedRt: 'hashed-rt' });

    const agent = request.agent(app.getHttpServer());

    await agent
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'P@ssw0rd123' })
      .expect(201);

    await agent.post('/auth/me').expect(201).expect({ ok: true });
  });

  it('POST /auth/refresh refreshes tokens using refresh_token cookie', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(userMock);
    mockPrisma.user.update.mockResolvedValue({ ...userMock, hashedRt: 'hashed-rt' });

    const agent = request.agent(app.getHttpServer());

    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'P@ssw0rd123' })
      .expect(201);

    const setCookie = getSetCookieHeader(loginResponse);
    const refreshCookie = setCookie?.find((c) => c.startsWith('refresh_token='));
    expect(refreshCookie).toBeDefined();
    const refreshToken = (refreshCookie as string)
      .split(';')[0]
      .replace('refresh_token=', '');

    // refreshTokens() checks DB hashedRt against cookie refresh token
    mockPrisma.user.findUnique.mockResolvedValue({
      ...userMock,
      hashedRt: bcrypt.hashSync(refreshToken, 10),
    });

    const response = await agent.post('/auth/refresh').expect(201);
    expect(response.body).toEqual({ ok: true });

    const refreshedSetCookie = getSetCookieHeader(response);
    expect(refreshedSetCookie).toBeDefined();
    expect(refreshedSetCookie.join(';')).toContain('access_token=');
    expect(refreshedSetCookie.join(';')).toContain('refresh_token=');
  });

  it('POST /auth/logout clears cookies', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(userMock);
    mockPrisma.user.update.mockResolvedValue({ ...userMock, hashedRt: 'hashed-rt' });

    const agent = request.agent(app.getHttpServer());

    await agent
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'P@ssw0rd123' })
      .expect(201);

    mockPrisma.user.update.mockResolvedValue({ ...userMock, hashedRt: null });

    const response = await agent.post('/auth/logout').expect(201);
    expect(response.body).toEqual({ ok: true });

    const setCookie = getSetCookieHeader(response);
    expect(setCookie).toBeDefined();
    expect(setCookie.join(';')).toContain('access_token=;');
    expect(setCookie.join(';')).toContain('refresh_token=;');
  });
});
