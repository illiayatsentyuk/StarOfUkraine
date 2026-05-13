---
name: frontend-testing
description: >-
  Playwright testing expert for the StarOfUkraine Nuxt 4 frontend (E2E-first).
  Knows the project's srcDir convention (app/), Nuxt runtime behaviors, and how
  to mock backend calls via Playwright routing (page.route), authenticate via
  storageState, and write stable, user-centric tests. Use when writing or fixing
  Playwright tests (*.spec.ts) for critical flows, pages, and API integration.
category: testing
risk: low
source: project
date_added: "2026-05-05"
---

# Frontend Testing

Playwright testing for `apps/frontend` (Nuxt 4). This skill is **E2E-first**: verify real user flows in a running app and mock backend calls at the network layer when needed.

## Project Layout

```
apps/frontend/
├── app/                       # srcDir
│   ├── composables/
│   ├── stores/
│   ├── utils/
│   └── components/
├── tests/
│   ├── e2e/                    # *.spec.ts
│   ├── fixtures/               # test users, seed payloads, etc.
│   └── helpers/                # route mocks, auth helpers
├── playwright.config.ts
└── package.json
```

---

## Setup

### Install dev dependencies

```bash
pnpm add -D @playwright/test
```

Then install browsers (once per machine / CI image):

```bash
pnpm exec playwright install --with-deps
```

### `playwright.config.ts` (place in `apps/frontend/`)

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'pnpm dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
```

### `package.json` scripts to add

Add these to `apps/frontend/package.json`:

```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:e2e:debug": "playwright test --debug",
"test:e2e:report": "playwright show-report"
```

---

## Core Rule: Prefer Network-Layer Mocks Over App Internals

Nuxt plugins/composables (like `useApi()` → `useNuxtApp().$api`) are runtime concerns; in Playwright, prefer validating behavior via UI + network.

- Mock backend calls with `page.route()` (or `context.route()` for global)
- Assert outgoing requests with `page.waitForRequest()` / `page.waitForResponse()`
- Avoid stubbing composables directly (that’s a unit-test concern)

---

## API Mocking Template (`page.route`)

```ts
// tests/e2e/helpers/mock-api.ts
import type { Page, Route } from '@playwright/test'

type Json = Record<string, unknown> | unknown[]

export async function mockJson(
  page: Page,
  url: string | RegExp,
  body: Json,
  status = 200,
) {
  await page.route(url, async (route: Route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    })
  })
}
```

Example usage:

```ts
import { test, expect } from '@playwright/test'
import { mockJson } from '../helpers/mock-api'

test('tournaments list shows items', async ({ page }) => {
  await mockJson(page, /\/tournaments/, {
    data: [{ id: 't-1', name: 'Cup 2026' }],
    totalPages: 1,
  })

  await page.goto('/tournaments')
  await expect(page.getByText('Cup 2026')).toBeVisible()
})
```

---

## Auth Pattern: `storageState`

For flows requiring auth, prefer logging in once and reusing state.

```ts
// tests/e2e/helpers/auth.ts
import type { Page } from '@playwright/test'

export async function loginUi(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /sign in|login/i }).click()
}
```

Generate a `storageState` file:

```ts
// tests/e2e/auth.setup.ts
import { test as setup } from '@playwright/test'
import { loginUi } from './helpers/auth'

setup('authenticate', async ({ page }) => {
  await loginUi(page, process.env.E2E_EMAIL!, process.env.E2E_PASSWORD!)
  await page.context().storageState({ path: 'tests/.auth/state.json' })
})
```

Then enable it in `playwright.config.ts` by adding a setup project and using `storageState` for the main project.

---

## Test Writing Rules (stability)

- Prefer `getByRole` / `getByLabel` / `getByText` over CSS selectors.
- Avoid arbitrary `waitForTimeout`; wait for a UI state or a network response instead.
- Make each test assert one behavior; cover both happy path and error case when the flow is critical.

## Checklist

- [ ] `@playwright/test` installed and browsers installed
- [ ] `playwright.config.ts` points to `tests/e2e` and runs `pnpm dev` via `webServer`
- [ ] Tests are user-centric (prefer `getByRole` / `getByLabel`) and avoid brittle selectors
- [ ] Backend interactions mocked with `page.route()` when the API is not required
- [ ] Auth handled via `storageState` for speed and stability (when auth is needed)
- [ ] Failures capture trace + screenshot + video (config defaults)

## Additional Resources

- For ready-to-paste test templates, see [examples.md](examples.md)
