---
name: backend-logging
description: >-
  Structured logging expert for the StarOfUkraine NestJS backend. The project
  uses pino-nestjs (pino under the hood). Knows how to configure LoggerModule,
  inject PinoLogger into services, set log levels per environment, redact
  sensitive fields, and replace the legacy NestJS Logger. Use when adding logs
  to a service, configuring LoggerModule, or when the user mentions pino,
  structured logs, log levels, log context, or redaction.
category: observability
risk: low
source: project
date_added: "2026-05-07"
---

# Backend Logging

Structured JSON logging for `apps/backend` via **`pino-nestjs`** (wraps `pino` + `pino-http`).

---

## Package

```
pino-nestjs   ← already installed
```

No extra installs needed. Do NOT install `nestjs-pino` (different package).

---

## Bootstrap (`main.ts`)

`bufferLogs: true` ensures log output is held until the pino transport is ready.
`app.useLogger(app.get(Logger))` replaces NestJS's default console logger.

```typescript
import { NestFactory } from '@nestjs/core';
import { Logger } from 'pino-nestjs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  // ... rest of bootstrap
}
void bootstrap();
```

---

## Module Registration (`app.module.ts`)

### Development — pretty-printed logs

```typescript
import { LoggerModule } from 'pino-nestjs';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isDev = config.get('NODE_ENV') !== 'production';
        return {
          pinoHttp: {
            level: isDev ? 'debug' : 'info',
            transport: isDev
              ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
              : undefined,
            redact: {
              paths: ['req.headers.authorization', 'req.headers.cookie', '*.hash', '*.hashedRt', '*.resetToken'],
              censor: '[REDACTED]',
            },
            serializers: {
              req(req) {
                return { method: req.method, url: req.url, id: req.id };
              },
            },
          },
        };
      },
    }),
    // ...
  ],
})
export class AppModule {}
```

> **Important:** `NODE_ENV` must be set in `.env`. Add `NODE_ENV=development` to `.env.example`.

---

## Injecting the Logger into Services

**Never** use `new Logger()` from `@nestjs/common` in services — it bypasses pino and loses structured context.

### Option A — `InjectPinoLogger` (recommended for services)

```typescript
import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'pino-nestjs';

@Injectable()
export class TournamentService {
  constructor(
    @InjectPinoLogger(TournamentService.name)
    private readonly logger: PinoLogger,
    // ... other deps
  ) {}

  async create(data: CreateTournamentDto) {
    this.logger.info({ name: data.name }, 'Creating tournament');
    // ...
    this.logger.info({ tournamentId: tournament.id }, 'Tournament created');
    return tournament;
  }
}
```

### Option B — `Logger` from `pino-nestjs` (for gateways / middleware)

```typescript
import { Logger } from 'pino-nestjs';

@Injectable()
export class TournamentGateway {
  constructor(private readonly logger: Logger) {}

  handleConnection(client: Socket) {
    this.logger.log('Client connected', { socketId: client.id });
  }
}
```

---

## Log Levels

| Level | When to use |
|---|---|
| `trace` | Very fine-grained debug (disabled in production) |
| `debug` | Cache hits/misses, token refresh, internal flow |
| `info` | Normal business events: tournament created, team joined |
| `warn` | Recoverable issues: missing optional config, retries |
| `error` | Unhandled errors, thrown exceptions caught at a high level |
| `fatal` | App cannot continue — database unreachable at boot |

### Environment defaults

| `NODE_ENV` | Minimum level | Format |
|---|---|---|
| `development` | `debug` | pino-pretty (colored, single-line) |
| `production` | `info` | JSON (no transport) |
| `test` | `silent` | suppressed entirely |

For tests, set `level: 'silent'` or mock the logger — do **not** let pino print during Jest runs.

---

## Structured Log Fields

Always pass context as a **first object argument**, message as the second:

```typescript
// ✅ correct — fields are queryable in log aggregators
this.logger.info({ tournamentId: id, userId }, 'User joined tournament');

// ❌ wrong — context is buried in a string
this.logger.info(`User ${userId} joined tournament ${id}`);
```

### Recommended field names (consistent across the project)

| Field | Type | Example |
|---|---|---|
| `tournamentId` | `string` | `'cuid...'` |
| `teamId` | `string` | `'cuid...'` |
| `userId` | `string` | `'cuid...'` |
| `taskId` | `string` | `'cuid...'` |
| `email` | `string` | only for auth flows, never log passwords |
| `ttlMs` | `number` | cache TTL value |
| `durationMs` | `number` | how long an operation took |
| `error` | `Error` | pass the raw error object, not `.message` |

---

## Error Logging

Pass the raw `Error` object so pino captures `message`, `stack`, and any custom fields:

```typescript
try {
  await this.prisma.tournament.create({ data });
} catch (err) {
  this.logger.error({ err, tournamentId: data.id }, 'Failed to create tournament');
  throw err;
}
```

---

## Redaction Rules

**Fields that must always be redacted** (already configured in `LoggerModule`):

- `req.headers.authorization` — Bearer tokens
- `req.headers.cookie` — access/refresh cookies
- `*.hash` — bcrypt password hashes
- `*.hashedRt` — hashed refresh tokens
- `*.resetToken` — password reset tokens

Never log:
- Raw passwords / `SignupDto.password`
- JWT secret values
- Database connection strings

---

## Module Providers (adding logger to a module)

`LoggerModule` is **global** — no need to import it in feature modules.
Just inject `PinoLogger` directly:

```typescript
// tournament.module.ts
@Module({
  providers: [TournamentService, PrismaService], // no LoggerModule needed
})
export class TournamentModule {}
```

---

## Mocking in Unit Tests

Do **not** use `LoggerModule` in unit test modules — it requires transports. Provide a simple mock:

```typescript
import { PinoLogger } from 'pino-nestjs';

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  setContext: jest.fn(),
};

const module = await Test.createTestingModule({
  providers: [
    TournamentService,
    { provide: PrismaService, useValue: mockPrisma },
    { provide: getLoggerToken(TournamentService.name), useValue: mockLogger },
  ],
}).compile();
```

Import `getLoggerToken` from `pino-nestjs` to match the injection token created by `@InjectPinoLogger`.

---

## Checklist

- [ ] `main.ts` uses `bufferLogs: true` and `app.useLogger(app.get(Logger))`
- [ ] `LoggerModule.forRootAsync` reads `NODE_ENV` to switch between pretty and JSON
- [ ] Sensitive fields are redacted in `pinoHttp.redact`
- [ ] Services use `@InjectPinoLogger(ServiceName.name)` — no `new Logger()`
- [ ] Log calls pass context object first, message string second
- [ ] Error logs pass the raw `err` object
- [ ] Unit tests mock the logger via `getLoggerToken`
- [ ] `NODE_ENV=development` added to `.env.example`
