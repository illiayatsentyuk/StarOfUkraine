# StarOfUkraine

Monorepo for **StarOfUkraine**: a NestJS API with Prisma and a Nuxt 4 frontend for tournaments and teams.

## Apps

| App | Stack | Local URL |
| --- | --- | --- |
| [Backend](apps/backend/README.md) | NestJS, Prisma, Postgres, Swagger | `http://localhost:3000` (default) |
| [Frontend](apps/frontend/README.md) | Nuxt 4, Pinia, PrimeVue, Playwright E2E | `http://localhost:4040` (dev / preview) |

## Prerequisites

- **Node.js** ≥ 18 (see root `package.json` `engines`)
- **pnpm** 9 (`packageManager` field)
- **Postgres** for local backend (connection strings in `apps/backend/.env`)

## Installation

From the repository root:

```bash
pnpm install
```

## Development

Run **all** dev tasks via Turbo (backend + frontend in parallel):

```bash
pnpm dev
```

Or run a single app:

```bash
pnpm --filter backend dev
pnpm --filter frontend dev
```

## Docker

The project includes a `docker-compose.yml` for quick setup of the full stack (Backend + Frontend + Redis).

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Quick Start
1. **Prepare Environment**: Copy `.env.example` to `.env` in `apps/backend/`.
2. **Build and Start**:
   ```bash
   docker compose up --build
   ```
3. **Initialize Database**: Once the containers are running, run migrations:
   ```bash
   # Run from host machine (monorepo root)
   docker compose exec backend pnpm --filter backend exec prisma migrate dev
   ```

### URLs
- **Frontend**: `http://localhost:4040`
- **Backend API**: `http://localhost:3000`
- **Swagger Docs**: `http://localhost:3000/api/docs`

## Root scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | `turbo run dev` — start app dev servers |
| `pnpm build` | `turbo run build` — production builds |
| `pnpm lint` | `turbo run lint` — lint (Biome on backend) |
| `pnpm format` | Prettier on `**/*.{ts,tsx,md}` |
| `pnpm check-types` | `turbo run check-types` |
| `pnpm prepare` | Husky git hooks |

## API documentation

With the backend running: **Swagger UI** at [http://localhost:3000/api/docs](http://localhost:3000/api/docs) (path may differ if `PORT` is overridden). Tournament flows (tasks, jury assignment, leaderboard gating) are summarized in the [backend README](apps/backend/README.md).

## Testing

**Backend** (from root):

```bash
pnpm --filter backend test
pnpm --filter backend test:e2e
```

**Frontend** (Playwright — install browsers once: `pnpm --filter frontend exec playwright install chromium`):

```bash
pnpm --filter frontend test:e2e
```

## Git hooks

`.husky/pre-commit` runs backend **lint + unit tests**, then frontend **E2E** tests. Ensure dependencies and Playwright are set up before committing.

## Contributing

Use feature branches and pull requests. Do not commit real secrets; use each app’s `.env.example` as a template.
