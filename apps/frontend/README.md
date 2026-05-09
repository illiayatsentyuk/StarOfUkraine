# StarOfUkraine Frontend

Nuxt 4 SPA for StarOfUkraine: tournaments, teams, auth, and admin flows. Source lives under `app/` (`srcDir`).

## Prerequisites

- Node.js ≥ 18 and **pnpm** (see monorepo root)
- Running **backend API** (or a deployed API URL) for real data; E2E tests mock HTTP with Playwright

## Installation

From the monorepo root:

```bash
pnpm install
```

## Environment variables

Copy `.env.example` to `.env` and adjust.

| Variable | Description | Default |
| --- | --- | --- |
| `API_URL` | Backend base URL for Axios (`runtimeConfig.public.apiURL`) | `https://starofukraine.onrender.com` (if unset at build time) |
| `PLAYWRIGHT_BASE_URL` | Optional; if set, Playwright skips starting `webServer` and uses this URL | — |
| `DEV_ADMIN_EMAIL` / `DEV_ADMIN_PASSWORD` | Optional dev helpers (see `nuxt.config`) | — |

Rebuild the app after changing `API_URL` so Nuxt embeds the new `runtimeConfig`.

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Nuxt dev server (port **4040**, see `nuxt.config.ts`) |
| `pnpm build` | Production build |
| `pnpm preview` | Serve production build locally |
| `pnpm generate` | Static generation (`nuxt generate`) |
| `pnpm test:e2e` | Playwright tests (`tests/e2e/`) |
| `pnpm test:e2e:ui` | Playwright UI mode |
| `pnpm test:e2e:debug` | Playwright debug |
| `pnpm test:e2e:report` | Open last HTML report |
| `pnpm postinstall` | `nuxt prepare` (runs after install) |

## E2E tests

1. Install browsers (once): `pnpm exec playwright install chromium` (or `--with-deps` for full install).
2. Config starts the app via `pnpm build && pnpm preview --port 4040` unless `PLAYWRIGHT_BASE_URL` is set.

```bash
pnpm test:e2e
```

## Stack (high level)

- **Nuxt 4**, **Vue 3**, **Pinia**, **PrimeVue**, **vee-validate**, **Pug** templates, **SCSS**
- HTTP client: **Axios** plugin with `withCredentials` (cookies)

## More documentation

- [Nuxt docs](https://nuxt.com/docs/getting-started/introduction)
- [Monorepo README](../../README.md)
