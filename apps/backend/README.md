# StarOfUkraine Backend (NestJS)

NestJS API for StarOfUkraine. Uses **Prisma** and **cookie-based auth** (HttpOnly `access_token` + `refresh_token`) with optional Bearer auth for tools like Swagger.

## Run

From repo root:

```bash
pnpm -C apps/backend dev
```

Default port is `3000` (or `PORT` env var).

## Swagger

Swagger UI is available at `GET /api/docs` (default `http://localhost:3000/api/docs`).

## Auth (routes)

- `POST /auth/signup`: register (sets HttpOnly cookies)
- `POST /auth/signin`: login (sets HttpOnly cookies)
- `POST /auth/me`: current user (requires `access_token`)
- `POST /auth/refresh`: refresh tokens (requires `refresh_token`)
- `POST /auth/logout`: logout (clears cookies)

## Teams / Tournaments (pagination list endpoints)

List endpoints use **POST** (body = `FindQueryDto`) and return 200:

- `POST /teams/list`
- `POST /tournaments/list`

Create endpoints remain protected:

- `POST /teams` (requires USER)
- `POST /tournaments` (requires ADMIN)

## Tests

Unit tests:

```bash
pnpm -C apps/backend test
```

E2E tests:

```bash
pnpm -C apps/backend test:e2e
```

## E2E env

Protected-route e2e helpers sign JWTs and require:

- `AT_SECRET` set in the environment
