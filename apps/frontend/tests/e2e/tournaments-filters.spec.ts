import { test, expect } from '@playwright/test'
import { mockJson } from './helpers/mock-api'
import { mockTournamentsListWithStatusFilter } from './helpers/mock-tournaments-list'
import { mockTournamentListResponse } from './fixtures/tournaments'

test.describe('tournament list filters', () => {
  test('status chip filter reloads list with ONGOING only', async ({ page }) => {
    await mockTournamentsListWithStatusFilter(page)

    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Draft Cup' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Live Cup' })).toBeVisible()

    await page.getByRole('button', { name: 'Триває' }).click()

    await expect(page.getByRole('heading', { name: 'Live Cup' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Draft Cup' })).toHaveCount(0)
  })

  test('sort filter sends sortBy name to API', async ({ page }) => {
    await mockJson(page, /\/tournaments\/list/, mockTournamentListResponse)

    await page.goto('/')

    // `loadFromDatabase` no-ops while `loading` is true; clicking sort during the first
    // GET would skip the second request and this test would time out.
    await expect(page.getByRole('heading', { name: 'Cup 2026' })).toBeVisible()

    const sortRequest = page.waitForRequest((req) => {
      if (!req.url().includes('/tournaments/list') || req.method() !== 'GET') return false
      try {
        const url = new URL(req.url())
        return url.searchParams.get('sortBy') === 'name'
      } catch {
        return false
      }
    })

    await page.getByRole('button', { name: 'За назвою' }).click()
    await sortRequest
  })
})
