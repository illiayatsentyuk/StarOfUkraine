# Prisma Expert — Reference

## Schema: This Project (StarOfUkraine)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum Role {
  USER
  ADMIN
  JURY
}

enum TournamentStatus {
  DRAFT
  REGISTRATION_OPEN
  ONGOING
  COMPLETED
  CANCELLED
}
```

### .env setup (Supabase)
```env
# Pooled connection (pgBouncer) — used by app at runtime
DATABASE_URL="postgresql://user:pass@host:6543/postgres?pgbouncer=true"

# Direct connection — used by prisma migrate
DIRECT_URL="postgresql://user:pass@host:5432/postgres"
```

---

## Advanced Schema Patterns

### Composite unique
```prisma
model TeamMember {
  teamId String
  userId String

  @@unique([teamId, userId])
}
```

### Composite index
```prisma
model Tournament {
  status    TournamentStatus
  startDate DateTime

  @@index([status, startDate])
}
```

### Self-relation
```prisma
model Category {
  id       String     @id @default(cuid())
  parent   Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  parentId String?
  children Category[] @relation("CategoryTree")
}
```

---

## Advanced Query Patterns

### Upsert
```typescript
const user = await prisma.user.upsert({
  where: { email: 'user@example.com' },
  update: { name: 'New Name' },
  create: { email: 'user@example.com', name: 'New Name', password: hashedPwd },
});
```

### Count + data in one query
```typescript
const [total, items] = await prisma.$transaction([
  prisma.tournament.count({ where: { status: 'ACTIVE' } }),
  prisma.tournament.findMany({
    where: { status: 'ACTIVE' },
    skip: 0,
    take: 10,
  }),
]);
```

### Raw query (complex aggregations)
```typescript
const result = await prisma.$queryRaw<{ count: bigint }[]>`
  SELECT COUNT(*) as count FROM "Tournament"
  WHERE "status" = ${TournamentStatus.ONGOING}
`;
const count = Number(result[0].count);
```

### Soft delete pattern
```prisma
model Tournament {
  deletedAt DateTime?
}
```

```typescript
// Filter out deleted
const active = await prisma.tournament.findMany({
  where: { deletedAt: null },
});

// Soft delete
await prisma.tournament.update({
  where: { id },
  data: { deletedAt: new Date() },
});
```

---

## Migration Workflow

### Feature branch workflow
```bash
# 1. Create migration
npx prisma migrate dev --name add_tournament_winner

# 2. Review generated SQL in prisma/migrations/

# 3. Commit both schema.prisma and the migration folder
git add prisma/
git commit -m "feat(db): add tournament winner field"

# 4. In CI/CD before deployment
npx prisma migrate deploy
```

### Squash migrations (clean up dev history)
```bash
# 1. Reset dev database
npx prisma migrate reset

# 2. Create a single baseline migration
npx prisma migrate dev --name init
```

### Baseline existing database (first-time setup)
```bash
# 1. Create empty migration
mkdir -p prisma/migrations/0_init
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/0_init/migration.sql

# 2. Mark as applied without running
npx prisma migrate resolve --applied 0_init
```

---

## PrismaService Patterns for NestJS

### Global module (recommended)
```typescript
// prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}

// app.module.ts — import once, available everywhere
@Module({
  imports: [PrismaModule, AuthModule, TeamModule, TournamentModule],
})
export class AppModule {}
```

### With query logging in development
```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```
