# StarOfUkraine

Monorepo for **StarOfUkraine** (backend API + frontend app).

## What's inside

- **`apps/backend`**: NestJS API (Prisma, JWT/cookies, Swagger)
- **`apps/frontend`**: Nuxt frontend

## Prerequisites

- Node.js + pnpm
- Postgres (for local development; tests mock Prisma)

## Install

```bash
pnpm install
```

## Run (development)

Backend:

```bash
pnpm -C apps/backend dev
```

Frontend:

```bash
pnpm -C apps/frontend dev
```

## API docs (Swagger)

With backend running, open Swagger UI at `GET /api/docs` (default `http://localhost:3000/api/docs`).

## Tests

Backend unit tests:

```bash
pnpm -C apps/backend test
```

Backend e2e tests:

```bash
pnpm -C apps/backend test:e2e
```

