# Frontend Testing — Examples

Ready-to-paste test templates for every layer of the StarOfUkraine frontend.

---

## 1. `useTournamentsStore` — full example

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
    info: vi.fn(),
    warning: vi.fn(),
  })),
}))

const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}

const tournamentFixture = {
  id: 'tournament-1',
  name: 'Star of Ukraine Cup 2026',
  status: 'DRAFT',
}

describe('useTournamentsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(useApi).mockReturnValue(mockApi as any)
  })

  afterEach(() => vi.clearAllMocks())

  describe('loadFromDatabase', () => {
    it('populates tournaments and increments page', async () => {
      mockApi.post.mockResolvedValue({
        data: { data: [tournamentFixture], totalPages: 3 },
      })

      const { useTournamentsStore } = await import('~/stores/tournaments.store')
      const store = useTournamentsStore()

      await store.loadFromDatabase()

      expect(store.tournaments).toHaveLength(1)
      expect(store.tournaments[0].id).toBe('tournament-1')
    })

    it('appends on subsequent calls (no reset)', async () => {
      mockApi.post.mockResolvedValue({
        data: { data: [tournamentFixture], totalPages: 2 },
      })

      const { useTournamentsStore } = await import('~/stores/tournaments.store')
      const store = useTournamentsStore()

      await store.loadFromDatabase()
      await store.loadFromDatabase()

      expect(store.tournaments).toHaveLength(2)
    })

    it('resets list when resetData=true', async () => {
      mockApi.post.mockResolvedValue({
        data: { data: [tournamentFixture], totalPages: 1 },
      })

      const { useTournamentsStore } = await import('~/stores/tournaments.store')
      const store = useTournamentsStore()

      await store.loadFromDatabase()
      await store.loadFromDatabase(true)

      expect(store.tournaments).toHaveLength(1)
    })

    it('sets error and rethrows on API failure', async () => {
      mockApi.post.mockRejectedValue(new Error('Network error'))

      const { useTournamentsStore } = await import('~/stores/tournaments.store')
      const store = useTournamentsStore()

      await expect(store.loadFromDatabase()).rejects.toThrow('Network error')
      expect(store.error).toBe('Network error')
    })

    it('always resets loading to false', async () => {
      mockApi.post.mockResolvedValue({
        data: { data: [], totalPages: 0 },
      })

      const { useTournamentsStore } = await import('~/stores/tournaments.store')
      const store = useTournamentsStore()
      await store.loadFromDatabase()

      expect(store.loading).toBe(false)
    })
  })

  describe('deleteTournament', () => {
    it('removes tournament from list', async () => {
      mockApi.delete.mockResolvedValue({})

      const { useTournamentsStore } = await import('~/stores/tournaments.store')
      const store = useTournamentsStore()
      store.tournaments = [tournamentFixture as any]

      await store.deleteTournament('tournament-1')

      expect(store.tournaments).toHaveLength(0)
    })
  })

  describe('updateTournament', () => {
    it('replaces the updated tournament in the list', async () => {
      const updated = { ...tournamentFixture, name: 'Updated Name' }
      mockApi.patch.mockResolvedValue({ data: updated })

      const { useTournamentsStore } = await import('~/stores/tournaments.store')
      const store = useTournamentsStore()
      store.tournaments = [tournamentFixture as any]

      const result = await store.updateTournament('tournament-1', { name: 'Updated Name' })

      expect(result.name).toBe('Updated Name')
      expect(store.tournaments[0].name).toBe('Updated Name')
    })
  })

  describe('filteredTournaments (computed)', () => {
    it('returns all when statusFilter is "all"', async () => {
      const { useTournamentsStore } = await import('~/stores/tournaments.store')
      const store = useTournamentsStore()
      store.tournaments = [
        { ...tournamentFixture, status: 'DRAFT' } as any,
        { ...tournamentFixture, id: 't-2', status: 'ONGOING' } as any,
      ]

      expect(store.filteredTournaments).toHaveLength(2)
    })

    it('filters by status', async () => {
      const { useTournamentsStore } = await import('~/stores/tournaments.store')
      const store = useTournamentsStore()
      store.tournaments = [
        { ...tournamentFixture, status: 'DRAFT' } as any,
        { ...tournamentFixture, id: 't-2', status: 'ONGOING' } as any,
      ]
      store.statusFilter = 'DRAFT'

      expect(store.filteredTournaments).toHaveLength(1)
      expect(store.filteredTournaments[0].status).toBe('DRAFT')
    })
  })
})
```

---

## 2. `useTeamsStore` — key actions

```ts
// tests/stores/teams.store.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useApi } from '~/composables/useApi'

vi.mock('~/composables/useApi', () => ({ useApi: vi.fn() }))
vi.mock('~/composables/useServerSafeToast', () => ({
  useServerSafeToast: vi.fn(() => ({ success: vi.fn(), error: vi.fn() })),
}))

const mockApi = { get: vi.fn(), post: vi.fn(), delete: vi.fn() }

describe('useTeamsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(useApi).mockReturnValue(mockApi as any)
  })

  afterEach(() => vi.clearAllMocks())

  it('searchMembers returns empty array for short query', async () => {
    const { useTeamsStore } = await import('~/stores/teams.store')
    const store = useTeamsStore()

    const result = await store.searchMembers('a')

    expect(result).toEqual([])
    expect(mockApi.get).not.toHaveBeenCalled()
  })

  it('searchMembers calls API for query >= 2 chars', async () => {
    mockApi.get.mockResolvedValue({
      data: [{ id: 'u1', email: 'user@test.com' }],
    })

    const { useTeamsStore } = await import('~/stores/teams.store')
    const store = useTeamsStore()
    const result = await store.searchMembers('us')

    expect(mockApi.get).toHaveBeenCalledWith('/users/search', {
      params: { query: 'us' },
    })
    expect(result).toHaveLength(1)
  })

  it('hasMore is true when page <= totalPages', async () => {
    const { useTeamsStore } = await import('~/stores/teams.store')
    const store = useTeamsStore()
    store.totalPages = 3

    expect(store.hasMore).toBe(true)
  })
})
```

---

## 3. `useLoginStore` — auth actions

```ts
// tests/stores/auth.store.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useApi } from '~/composables/useApi'

vi.mock('~/composables/useApi', () => ({ useApi: vi.fn() }))
vi.mock('~/composables/useServerSafeToast', () => ({
  useServerSafeToast: vi.fn(() => ({ success: vi.fn(), error: vi.fn() })),
}))

// useRuntimeConfig is mocked globally in tests/setup.ts
// navigateTo is mocked globally in tests/setup.ts
// window.location.reload must be mocked to avoid happy-dom errors
Object.defineProperty(window, 'location', {
  value: { href: '', reload: vi.fn() },
  writable: true,
})

const mockApi = { get: vi.fn(), post: vi.fn() }

describe('useLoginStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(useApi).mockReturnValue(mockApi as any)
  })

  afterEach(() => vi.clearAllMocks())

  it('fetchUser sets user and isAdmin when API succeeds', async () => {
    mockApi.post.mockResolvedValue({
      data: { user: { id: 'u1', email: 'admin@test.com', role: 'ADMIN' } },
    })

    const { useLoginStore } = await import('~/stores/auth.store')
    const store = useLoginStore()
    await store.fetchUser()

    expect(store.user).toMatchObject({ role: 'ADMIN' })
    expect(store.isAdmin).toBe(true)
  })

  it('fetchUser nullifies user on API failure', async () => {
    mockApi.post.mockRejectedValue(new Error('Unauthorized'))

    const { useLoginStore } = await import('~/stores/auth.store')
    const store = useLoginStore()
    await store.fetchUser()

    expect(store.user).toBeNull()
    expect(store.isAdmin).toBe(false)
  })

  it('isAuthenticated is true when user is set', async () => {
    mockApi.post.mockResolvedValue({
      data: { user: { id: 'u1', email: 'user@test.com', role: 'USER' } },
    })

    const { useLoginStore } = await import('~/stores/auth.store')
    const store = useLoginStore()
    await store.fetchUser()

    expect(store.isAuthenticated).toBe(true)
  })
})
```

---

## 4. Pure Utils

```ts
// tests/utils/format-date.spec.ts
import { describe, it, expect } from 'vitest'
import { formatDate } from '~/utils/format-date'

describe('formatDate', () => {
  it('returns "ТВА" for empty string', () => {
    expect(formatDate('')).toBe('ТВА')
  })

  it('formats ISO date in Ukrainian uppercase', () => {
    const result = formatDate('2026-04-01T00:00:00.000Z')
    expect(result).toMatch(/КВІТНЯ/)
    expect(result).toMatch(/2026/)
  })
})
```

```ts
// tests/utils/tournament-status-ui.spec.ts
import { describe, it, expect } from 'vitest'
import { getTournamentStatusInfo } from '~/utils/tournament-status-ui'

describe('getTournamentStatusInfo', () => {
  it.each([
    ['REGISTRATION_OPEN', 'РЕЄСТРАЦІЯ', 'var(--color-primary)'],
    ['ONGOING', 'ТРИВАЄ', '#ff8800'],
    ['COMPLETED', 'ЗАВЕРШЕНО', '#00cc00'],
    ['CANCELLED', 'СКАСОВАНО', '#666666'],
    ['DRAFT', 'ОЧІКУВАННЯ', '#000000'],
  ])('status %s → label %s', (status, label, color) => {
    const result = getTournamentStatusInfo(status)
    expect(result?.label).toBe(label)
    expect(result?.color).toBe(color)
  })

  it('returns null for null input', () => {
    expect(getTournamentStatusInfo(null)).toBeNull()
  })

  it('returns DRAFT defaults for unknown status', () => {
    const result = getTournamentStatusInfo('UNKNOWN_STATUS')
    expect(result?.code).toBe('DRAFT')
  })
})
```
