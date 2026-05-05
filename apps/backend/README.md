# StarOfUkraine Backend

NestJS REST API for StarOfUkraine: **Prisma** + Postgres, **cookie-based auth** (HttpOnly `access_token` / `refresh_token`), optional **Bearer** tokens for tools like Swagger, **Socket.IO**, and **Swagger** at `/api/docs`.

## Prerequisites

- Node.js ≥ 18 and **pnpm**
- **Postgres** (local or hosted; Supabase-style `DATABASE_URL` + `DIRECT_URL` supported)

## Installation

From the monorepo root:

```bash
pnpm install
```

## Environment variables

Copy `.env.example` to `.env` and fill in real values. Never commit `.env`.

| Variable | Description | Example / default |
| --- | --- | --- |
| `DATABASE_URL` | Pooled Postgres URL (e.g. pgbouncer) | See `.env.example` |
| `DIRECT_URL` | Direct Postgres URL for migrations | See `.env.example` |
| `JWT_SECRET` | Signing secret | Generate strong value |
| `AT_SECRET` / `RT_SECRET` | Access / refresh token secrets | Generate strong values |
| `JWT_EXPIRES_IN` / `AT_EXPIRES_IN` / `RT_EXPIRES_IN` | Token lifetimes | `1d`, `15m`, `7d` |
| `RESET_PASSWORD_*` | Password reset signing + URL | — |
| `EMAIL_*` | SMTP for transactional email | — |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID | — |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 client secret | — |
| `GOOGLE_CALLBACK_URL` | Authorized redirect URI in Google Cloud (must match the API callback route) | `http://localhost:3000/auth/google/callback` |
| `FRONTEND_URL` | Nuxt origin for post-OAuth redirect (`/?oauth=success`); not the API URL | `http://localhost:4040` |
| `PAGE_SIZE` | Default list page size | `10` |
| `PORT` | HTTP port | `3000` |

Prisma CLI uses **`DIRECT_URL`** for migrations (see `prisma.config.ts`).

## Run

From monorepo root:

```bash
pnpm --filter backend dev
```

Default URL: `http://localhost:3000` (or `PORT`).

## Database (Prisma)

Run from `apps/backend`:

```bash
pnpm exec prisma migrate dev
pnpm exec prisma generate
```

Use your team’s workflow for `migrate deploy` in production.

## Swagger

**Swagger UI**: `GET /api/docs` — e.g. [http://localhost:3000/api/docs](http://localhost:3000/api/docs).

## Auth (overview)

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/auth/signup` | Sets HttpOnly cookies |
| `POST` | `/auth/signin` | Sets HttpOnly cookies |
| `POST` | `/auth/me` | Current user (`access_token`) |
| `POST` | `/auth/refresh` | Refresh tokens |
| `POST` | `/auth/logout` | Clears cookies |
| `GET` | `/auth/google/login` | Starts **Google OAuth**; redirects the browser to Google’s consent screen |
| `GET` | `/auth/google/callback` | **Google OAuth callback**; validates the code, sets `access_token` / `refresh_token` cookies, then **302** redirects to `{FRONTEND_URL}/?oauth=success` (see `FRONTEND_URL` above) |

Configure **`GOOGLE_CALLBACK_URL`** in `.env` to the full URL of `/auth/google/callback` on this API (e.g. `http://localhost:3000/auth/google/callback`) and register the same URI in the Google Cloud console.

## Teams / tournaments (list endpoints)

Paginated **POST** list endpoints (body uses `FindQueryDto`):

- `POST /teams/list`
- `POST /tournaments/list`

Create endpoints (protected):

- `POST /teams` — requires **USER**
- `POST /tournaments` — requires **ADMIN**

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Nest watch mode |
| `pnpm build` | Compile to `dist/` |
| `pnpm start` | Nest start |
| `pnpm start:prod` | `node dist/main` |
| `pnpm start:debug` | Debug + watch |
| `pnpm lint` | Biome lint (write) |
| `pnpm format` | Biome format (write) |
| `pnpm lint:check` | Biome check (write) |
| `pnpm test` | Jest unit tests (`*.spec.ts`) |
| `pnpm test:watch` | Jest watch |
| `pnpm test:cov` | Jest with coverage |
| `pnpm test:debug` | Jest with Node inspector |
| `pnpm test:e2e` | Jest E2E (`test/jest-e2e.json`) |

## E2E tests

Protected-route helpers may require **`AT_SECRET`** (and related JWT env) in the environment. See test setup under `test/`.

```bash
pnpm test:e2e
```

## More documentation

- [Monorepo README](../../README.md)
