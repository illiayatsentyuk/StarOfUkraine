---
name: frontend-testing
description: >-
  Vitest + @vue/test-utils testing expert for the StarOfUkraine Nuxt 4 frontend.
  Knows the project's srcDir convention (app/), how to mock useApi (axios via
  useNuxtApp().$api), useServerSafeToast, Nuxt auto-imports (useRuntimeConfig,
  navigateTo), and patterns for Pinia setup stores and pure utils. Use when
  writing or fixing unit tests for stores (*.store.ts), composables, utils, or
  Vue components; when the user mentions vitest, @vue/test-utils, mocking useApi,
  or testing Pinia stores in the frontend.
category: testing
risk: low
source: project
date_added: "2026-05-05"
---

# Frontend Testing

Vitest + `@vue/test-utils` unit testing for `apps/frontend`. No tests exist yet — this skill sets up the toolchain and provides patterns.

## Project Layout

```
apps/frontend/
├── app/                       # srcDir
│   ├── composables/
│   ├── stores/
│   ├── utils/
│   └── components/
├── tests/
│   ├── setup.ts               # global mocks
│   ├── stores/                # *.store.spec.ts
│   ├── utils/                 # *.spec.ts
│   └── components/            # *.spec.ts
├── vitest.config.ts
└── package.json
```

---

## Setup

### Install dev dependencies

```bash
pnpm add -D vitest @vue/test-utils @vitejs/plugin-vue happy-dom
```

### `vitest.config.ts` (place in `apps/frontend/`)

```ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url)),
    },
  },
})
```

### `package.json` scripts to add

```json
"test": "vitest",
"test:run": "vitest run",
"test:cov": "vitest run --coverage"
```

### `tests/setup.ts` — global Nuxt auto-import mocks

```ts
import { vi } from 'vitest'

vi.mock('#imports', async () => {
  const vue = await vi.importActual<typeof import('vue')>('vue')
  return {
    ...vue,
    useRuntimeConfig: vi.fn(() => ({
      public: { apiURL: 'http://localhost:3001' },
    })),
    navigateTo: vi.fn(),
    useNuxtApp: vi.fn(),
  }
})
```

---

## Core Rule: Always Mock `useApi` and Nuxt Composables in Store Tests

`useApi()` returns `useNuxtApp().$api` — an Axios instance registered as a plugin. It is **never available** outside a running Nuxt app. Always mock the module:

```ts
import { vi } from 'vitest'

vi.mock('~/composables/useApi', () => ({ useApi: vi.fn() }))
vi.mock('~/composables/useServerSafeToast', () => ({
  useServerSafeToast: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  })),
}))
```

---

## Pinia Store Test Structure

```ts
// tests/stores/tournaments.store.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useApi } from '~/composables/useApi'

vi.mock('~/composables/useApi', () => ({ useApi: vi.fn() }))
vi.mock('~/composables/useServerSafeToast', () => ({
  useServerSafeToast: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn(),
  })),
}))

const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}

describe('useTournamentsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(useApi).mockReturnValue(mockApi as any)
  })

  afterEach(() => vi.clearAllMocks())

  it('loadFromDatabase populates tournaments', async () => {
    mockApi.post.mockResolvedValue({
      data: {
        data: [{ id: 't-1', name: 'Cup 2026' }],
        totalPages: 1,
      },
    })

    const { useTournamentsStore } = await import('~/stores/tournaments.store')
    const store = useTournamentsStore()
    await store.loadFromDatabase()

    expect(store.tournaments).toHaveLength(1)
    expect(store.tournaments[0].id).toBe('t-1')
  })
})
```

**Always** call `setActivePinia(createPinia())` in `beforeEach` — it resets store state between tests.

---

## Pure Utility Tests

No mocking needed. Import and call directly.

```ts
// tests/utils/tournament-status-ui.spec.ts
import { describe, it, expect } from 'vitest'
import { getTournamentStatusInfo } from '~/utils/tournament-status-ui'

describe('getTournamentStatusInfo', () => {
  it('returns null for falsy input', () => {
    expect(getTournamentStatusInfo(null)).toBeNull()
    expect(getTournamentStatusInfo('')).toBeNull()
  })

  it('returns DRAFT info for unknown status', () => {
    const result = getTournamentStatusInfo('UNKNOWN')
    expect(result?.code).toBe('DRAFT')
    expect(result?.label).toBe('ОЧІКУВАННЯ')
  })

  it('returns correct color for ONGOING', () => {
    const result = getTournamentStatusInfo('ONGOING')
    expect(result?.color).toBe('#ff8800')
  })
})
```

---

## Component Tests

```ts
// tests/components/TournamentCard.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import TournamentCard from '~/components/TournamentCard.vue'

describe('TournamentCard', () => {
  const pinia = createPinia()

  it('renders tournament name', () => {
    const wrapper = mount(TournamentCard, {
      global: { plugins: [pinia] },
      props: { tournament: { id: 't-1', name: 'Cup 2026', status: 'DRAFT' } },
    })
    expect(wrapper.text()).toContain('Cup 2026')
  })
})
```

---

## Spec File Placement

| What to test | Spec file location |
|---|---|
| `useTournamentsStore` | `tests/stores/tournaments.store.spec.ts` |
| `useTeamsStore` | `tests/stores/teams.store.spec.ts` |
| `useLoginStore` | `tests/stores/auth.store.spec.ts` |
| `getTournamentStatusInfo` | `tests/utils/tournament-status-ui.spec.ts` |
| `formatDate` | `tests/utils/format-date.spec.ts` |
| Any `.vue` component | `tests/components/<ComponentName>.spec.ts` |

---

## Checklist

- [ ] `vitest.config.ts` created with `happy-dom` environment and `~/` alias
- [ ] `tests/setup.ts` mocks `#imports` (Nuxt auto-imports)
- [ ] `useApi` mocked — never relies on a running Nuxt app
- [ ] `useServerSafeToast` mocked in every store test
- [ ] `setActivePinia(createPinia())` in `beforeEach` for all store tests
- [ ] `vi.clearAllMocks()` in `afterEach`
- [ ] Pure utils tested without any mocks
- [ ] Each `it` tests one behaviour
- [ ] Both happy path and error cases covered

## Additional Resources

- For ready-to-paste test templates, see [examples.md](examples.md)
