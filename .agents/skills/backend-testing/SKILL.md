---
name: backend-testing
description: >-
  NestJS unit and e2e testing expert for the StarOfUkraine backend. Knows the
  project's Jest setup (inline in package.json, e2e via test/jest-e2e.json),
  how to mock PrismaService and JwtService, and patterns for TeamService,
  TournamentService, and AuthService. Use when writing or fixing unit tests
  (*.spec.ts), e2e tests (*.e2e-spec.ts), or when the user mentions jest,
  supertest, mocking, test coverage, or testing a controller/service.
category: testing
risk: low
source: project
date_added: "2026-03-24"
---

# Backend Testing

NestJS + Jest testing for `apps/backend`. Uses `@nestjs/testing`, `jest`, `supertest`.

## Project Setup

| Type | File pattern | Root | Run |
|---|---|---|---|
| Unit | `src/**/*.spec.ts` | `src/` | `npm run test` |
| E2E | `test/*.e2e-spec.ts` | `test/` | `npm run test:e2e` |
| Coverage | — | — | `npm run test:cov` |

No `jest.config.ts` — unit config is inline in `package.json` under `"jest"`.

---

## Core Rule: Never Import Real PrismaService in Unit Tests

`PrismaService` needs `DATABASE_URL` and a live DB. Always mock it:

```typescript
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
};
```

Provide it as:
```typescript
{ provide: PrismaService, useValue: mockPrisma }
```

Similarly mock `JwtService` for auth tests:
```typescript
const mockJwt = { sign: jest.fn().mockReturnValue('mock-token') };
{ provide: JwtService, useValue: mockJwt }
```

---

## Unit Test Structure

```typescript
// src/<module>/<module>.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TeamService } from './team.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TeamService', () => {
  let service: TeamService;
  let prisma: typeof mockPrisma;

  const mockPrisma = { team: { findFirst: jest.fn(), /* ... */ } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TeamService>(TeamService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

Always call `jest.clearAllMocks()` in `afterEach`.

---

## Pagination Tests (TeamService / TournamentService)

`findAll` now returns `{ data, currentPage, nextPage, previousPage, totalPages, totalItems }`.  
Tests must mock both `count()` and `findMany()`:

```typescript
it('returns paginated result', async () => {
  mockPrisma.team.count.mockResolvedValue(25);
  mockPrisma.team.findMany.mockResolvedValue([{ id: '1', teamName: 'Alpha' }]);

  const result = await service.findAll({ page: 1, limit: 10 });

  expect(result.totalItems).toBe(25);
  expect(result.totalPages).toBe(3);
  expect(result.currentPage).toBe(1);
  expect(result.nextPage).toBe(2);
  expect(result.previousPage).toBeNull();
  expect(result.data).toHaveLength(1);
});

it('throws BadRequestException when page exceeds maximum', async () => {
  mockPrisma.team.count.mockResolvedValue(5);
  await expect(service.findAll({ page: 99, limit: 10 }))
    .rejects.toThrow('Page number is too high');
});
```

---

## Auth Tests

Mock `bcrypt` to avoid slow hashing in tests:

```typescript
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(true),
}));
```

```typescript
it('returns accessToken on register', async () => {
  mockPrisma.user.create.mockResolvedValue({
    id: 'u1', email: 'a@b.com', role: 'USER',
  });
  const result = await authService.register({
    email: 'a@b.com', password: 'pass',
  });
  expect(result.accessToken).toBe('mock-token');
});

it('throws UnauthorizedException on wrong password', async () => {
  mockPrisma.user.findUnique.mockResolvedValue({ password: 'hashed' });
  (bcrypt.compare as jest.Mock).mockResolvedValue(false);
  await expect(authService.login({ email: 'a@b.com', password: 'wrong' }))
    .rejects.toThrow('Invalid credentials');
});
```

---

## E2E Tests

E2E boots the real `AppModule` (requires `DATABASE_URL`). For isolated e2e, override `PrismaService` at the module level:

```typescript
// test/teams.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

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

  it('GET /teams returns paginated response', () => {
    mockPrisma.team.count.mockResolvedValue(2);
    mockPrisma.team.findMany.mockResolvedValue([]);
    return request(app.getHttpServer())
      .get('/teams')
      .expect(200)
      .expect(res => {
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('totalItems');
      });
  });
});
```

---

## Spec File Placement

| What to test | Spec file location |
|---|---|
| `TeamService` | `src/team/team.service.spec.ts` |
| `TournamentService` | `src/tournament/tournament.service.spec.ts` |
| `AuthService` | `src/auth/auth.service.spec.ts` |
| `TeamController` | `src/team/team.controller.spec.ts` |
| E2E teams | `test/teams.e2e-spec.ts` |
| E2E tournaments | `test/tournaments.e2e-spec.ts` |

---

## Checklist

- [ ] `PrismaService` mocked — never a real DB in unit tests
- [ ] `JwtService` mocked in auth tests
- [ ] `bcrypt` mocked to keep tests fast
- [ ] `jest.clearAllMocks()` in `afterEach`
- [ ] Each `it` tests one behaviour
- [ ] Both happy path and error cases covered
- [ ] Pagination tests mock both `count` and `findMany`

## Additional Resources

- For concrete ready-to-paste test templates, see [examples.md](examples.md)
