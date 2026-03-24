# Backend Testing Examples

## TeamService — full unit spec

```typescript
// src/team/team.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TeamService } from './team.service';
import { PrismaService } from '../prisma/prisma.service';

const mockTeam = {
  id: 'team-1',
  teamName: 'Star of Ukraine',
  captainName: 'Olena Kovalenko',
  captainEmail: 'olena@example.com',
  members: ['Olena', 'Taras'],
  city: 'Kyiv',
  organization: 'UA Esports',
  telegram: '@sou',
  discord: 'sou#1234',
  createdAt: new Date(),
};

const mockPrisma = {
  team: {
    findFirst:  jest.fn(),
    findMany:   jest.fn(),
    findUnique: jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    delete:     jest.fn(),
    count:      jest.fn(),
  },
};

describe('TeamService', () => {
  let service: TeamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<TeamService>(TeamService);
  });

  afterEach(() => jest.clearAllMocks());

  // --- create ---
  describe('create', () => {
    it('creates and returns a team', async () => {
      mockPrisma.team.findFirst.mockResolvedValue(null);
      mockPrisma.team.create.mockResolvedValue(mockTeam);
      const result = await service.create({ teamName: 'Star of Ukraine', captainName: 'Olena', captainEmail: 'o@e.com', members: [] });
      expect(result).toEqual(mockTeam);
    });

    it('throws BadRequestException if team name already exists', async () => {
      mockPrisma.team.findFirst.mockResolvedValue(mockTeam);
      await expect(service.create({ teamName: 'Star of Ukraine', captainName: 'X', captainEmail: 'x@e.com', members: [] }))
        .rejects.toThrow(BadRequestException);
    });
  });

  // --- findAll ---
  describe('findAll', () => {
    it('returns paginated response', async () => {
      mockPrisma.team.count.mockResolvedValue(15);
      mockPrisma.team.findMany.mockResolvedValue([mockTeam]);
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.totalItems).toBe(15);
      expect(result.totalPages).toBe(2);
      expect(result.currentPage).toBe(1);
      expect(result.nextPage).toBe(2);
      expect(result.previousPage).toBeNull();
      expect(result.data).toEqual([mockTeam]);
    });

    it('throws when page exceeds maximum', async () => {
      mockPrisma.team.count.mockResolvedValue(5);
      await expect(service.findAll({ page: 99, limit: 10 }))
        .rejects.toThrow('Page number is too high');
    });

    it('nextPage is null on last page', async () => {
      mockPrisma.team.count.mockResolvedValue(10);
      mockPrisma.team.findMany.mockResolvedValue([mockTeam]);
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.nextPage).toBeNull();
    });
  });

  // --- findOne ---
  describe('findOne', () => {
    it('returns team by id', async () => {
      mockPrisma.team.findUnique.mockResolvedValue(mockTeam);
      expect(await service.findOne('team-1')).toEqual(mockTeam);
    });

    it('throws NotFoundException when team does not exist', async () => {
      mockPrisma.team.findUnique.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  // --- remove ---
  describe('remove', () => {
    it('deletes and returns the team', async () => {
      mockPrisma.team.findUnique.mockResolvedValue(mockTeam);
      mockPrisma.team.delete.mockResolvedValue(mockTeam);
      expect(await service.remove('team-1')).toEqual(mockTeam);
    });

    it('throws NotFoundException if team does not exist', async () => {
      mockPrisma.team.findUnique.mockResolvedValue(null);
      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
```

---

## AuthService — full unit spec

```typescript
// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt', () => ({
  hash:    jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

const mockUser = {
  id: 'user-1',
  email: 'user@example.com',
  password: 'hashed-password',
  role: 'USER',
  name: 'Ivan',
};

const mockPrisma = {
  user: {
    create:     jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockJwt = { sign: jest.fn().mockReturnValue('access-token') };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService,    useValue: mockJwt },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('returns accessToken', async () => {
      mockPrisma.user.create.mockResolvedValue(mockUser);
      const result = await service.register({ email: 'user@example.com', password: 'pass' });
      expect(result.accessToken).toBe('access-token');
      expect(bcrypt.hash).toHaveBeenCalledWith('pass', 10);
    });
  });

  describe('login', () => {
    it('returns accessToken on valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.login({ email: 'user@example.com', password: 'pass' });
      expect(result.accessToken).toBe('access-token');
    });

    it('throws UnauthorizedException when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login({ email: 'x@e.com', password: 'pass' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException on wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login({ email: 'user@example.com', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});
```

---

## E2E — Teams endpoint (isolated, no real DB)

```typescript
// test/teams.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

const mockTeam = { id: 't1', teamName: 'Alpha', createdAt: new Date().toISOString() };
const mockPrisma = {
  team: {
    count:      jest.fn().mockResolvedValue(1),
    findMany:   jest.fn().mockResolvedValue([mockTeam]),
    findUnique: jest.fn().mockResolvedValue(mockTeam),
    findFirst:  jest.fn().mockResolvedValue(null),
    create:     jest.fn().mockResolvedValue(mockTeam),
    update:     jest.fn().mockResolvedValue(mockTeam),
    delete:     jest.fn().mockResolvedValue(mockTeam),
  },
};

describe('Teams (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());
  afterEach(() => jest.clearAllMocks());

  it('GET /teams returns paginated body', () =>
    request(app.getHttpServer())
      .get('/teams')
      .expect(200)
      .expect(res => {
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('totalItems');
        expect(res.body).toHaveProperty('totalPages');
      }),
  );

  it('GET /teams/:id returns team', () =>
    request(app.getHttpServer())
      .get('/teams/t1')
      .expect(200)
      .expect(res => expect(res.body.id).toBe('t1')),
  );

  it('POST /teams creates team', () =>
    request(app.getHttpServer())
      .post('/teams')
      .send({ teamName: 'Alpha', captainName: 'X', captainEmail: 'x@e.com', members: [] })
      .expect(201),
  );
});
```
