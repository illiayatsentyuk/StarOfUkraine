---
name: prisma-expert
description: >-
  Prisma ORM expert for schema design, migrations, query optimization, relations
  modeling, and database operations. Knows Prisma 7 specifics: prisma.config.ts,
  defineConfig, custom output pitfalls, Supabase/pgBouncer connection setup.
  Use PROACTIVELY for Prisma schema issues, migration problems, query
  performance, relation modeling, PrismaService setup in NestJS, or any
  @prisma/client errors.
---

# Prisma Expert — v7.5.0

## Prisma 7 Architecture (Critical — Different from v5/v6)

Prisma 7 splits configuration into **two separate concerns**:

| File | Purpose | Used by |
|---|---|---|
| `prisma.config.ts` | CLI config (schema path, migrations path, datasource URL) | `prisma migrate`, `prisma generate`, `prisma studio` |
| `prisma/schema.prisma` | Schema definition + runtime datasource | `PrismaClient` at runtime |

**The schema datasource MUST have `url` for runtime.** `prisma.config.ts` only feeds the CLI — the runtime `PrismaClient` never reads it.

### Correct prisma.config.ts (v7)
```typescript
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
```

### Correct schema.prisma datasource (Supabase + pgBouncer)
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

`DATABASE_URL` uses pgBouncer (`?pgbouncer=true`, port 6543) for app connections.  
`DIRECT_URL` uses direct connection (port 5432) so migrations work correctly.

---

## Custom Output — Do NOT Use

**Never** set a custom `output` in the generator:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../generated/prisma"
}

generator client {
  provider = "prisma-client-js"
}
```

Always import from `@prisma/client`:
```typescript
import { PrismaClient, TournamentStatus, Role } from '@prisma/client';
```

---

## NestJS PrismaService Pattern (v7)

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

**No custom constructor needed** — `PrismaClient` reads `DATABASE_URL` from the environment automatically when `url = env("DATABASE_URL")` is in the schema.

If you see `PrismaClientInitializationError: needs to be constructed with valid PrismaClientOptions`:
→ The schema `datasource` block is **missing `url`**. Add `url = env("DATABASE_URL")`.

---

## CLI Commands (v7)

```bash
npx prisma generate
npx prisma migrate dev --name descriptive_name
npx prisma migrate deploy
npx prisma migrate status
npx prisma validate
npx prisma format
npx prisma studio
npx prisma db push
```

---

## Schema Design

### Field conventions
```prisma
model Example {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Relations
```prisma
model User {
  id    String @id @default(cuid())
  posts Post[]
}

model Post {
  id       String @id @default(cuid())
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId String

  @@index([authorId])
}
```

### Enums
```prisma
enum Status {
  DRAFT
  ACTIVE
  ARCHIVED
}
```

Import enums from `@prisma/client` — never redeclare them:
```typescript
import { Status } from '@prisma/client';
```

---

## Query Patterns

### Avoid N+1
```typescript
const users = await prisma.user.findMany();
for (const u of users) {
  const posts = await prisma.post.findMany({ where: { authorId: u.id } });
}
```

```typescript
const usersWithPosts = await prisma.user.findMany({
  include: { posts: true },
});
```

```typescript
const usersSelected = await prisma.user.findMany({
  select: { id: true, email: true, posts: { select: { id: true, title: true } } },
});
```

### Transactions
```typescript
const [user, team] = await prisma.$transaction([
  prisma.user.create({ data: userData }),
  prisma.team.create({ data: teamData }),
]);

const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  if (!user) throw new Error('User creation failed');
  return tx.team.update({ where: { id: teamId }, data: { captainEmail: user.email } });
}, { timeout: 10000 });
```

### Pagination
```typescript
const page = await prisma.tournament.findMany({
  skip: (pageNumber - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' },
});
```

---

## Query Logging (Development)

```typescript
new PrismaClient({
  log: [{ emit: 'event', level: 'query' }],
});

prisma.$on('query', (e) => {
  console.log(`${e.query} — ${e.duration}ms`);
});
```

---

## Migration Safety

| Environment | Command | Notes |
|---|---|---|
| Development | `prisma migrate dev` | Creates migration + applies |
| Production | `prisma migrate deploy` | Applies pending only, never creates |
| Prototype | `prisma db push` | No migration file, dangerous on prod |

**Never use `migrate dev` in production.** If a migration fails:
```bash
npx prisma migrate resolve --applied "20240101_migration_name"
npx prisma migrate resolve --rolled-back "20240101_migration_name"
```

---

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `PrismaClientInitializationError: needs valid PrismaClientOptions` | `datasource` in schema has no `url` | Add `url = env("DATABASE_URL")` to schema |
| `Cannot find module '../../generated/prisma'` | Custom output + tsc doesn't copy JS | Remove `output`, use `@prisma/client` |
| `Error: Direct URL needed for migrations` | pgBouncer doesn't support migrations | Add `directUrl = env("DIRECT_URL")` to schema |
| `P2002: Unique constraint failed` | Duplicate value on `@unique` field | Check data before insert, handle error |
| `P2025: Record not found` | `update`/`delete` on non-existent id | Use `findFirst` to check, or `upsert` |
| `P2034: Transaction conflict` | Concurrent write conflict | Retry transaction logic |

---

## Additional Reference
- For query examples and advanced patterns, see [reference.md](reference.md)
