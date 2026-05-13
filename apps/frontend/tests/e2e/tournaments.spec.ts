import { test, expect } from '@playwright/test'
import { mockJson } from './helpers/mock-api'
import {
  mockEmptyTeamsList,
  mockTournamentDetail,
  mockTournamentListResponse,
} from './fixtures/tournaments'

test.beforeEach(async ({ page }) => {
  // Prevent redirect loops by mocking auth/me for all tournament tests
  await mockJson(page, /\/auth\/me/, null)
})

test.describe('tournaments list', () => {
  test('home shows tournaments from API', async ({ page }) => {
    await mockJson(page, /\/tournaments\/list/, mockTournamentListResponse)

    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'АКТИВНІ ТУРНІРИ' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Cup 2026' })).toBeVisible({ timeout: 15000 })
  })

  test('/tournaments route shows the same list', async ({ page }) => {
    await mockJson(page, /\/tournaments\/list/, mockTournamentListResponse)

    await page.goto('/tournaments')
    await expect(page.getByRole('heading', { name: 'АКТИВНІ ТУРНІРИ' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Cup 2026' })).toBeVisible({ timeout: 15000 })
  })

  test('empty API response shows empty state', async ({ page }) => {
    await mockJson(page, /\/tournaments\/list/, {
      data: [],
      totalPages: 0,
    })

    await page.goto('/')

    await expect(page.getByText('Турнірів поки немає.')).toBeVisible()
  })
})

test.describe('tournament detail', () => {
  test('tournament card navigates to detail page', async ({ page }) => {
    await mockJson(page, /\/tournaments\/list/, mockTournamentListResponse)
    await mockJson(page, /\/tournaments\/t-1/, mockTournamentDetail)
    await mockJson(page, /\/teams\/list/, mockEmptyTeamsList)

    await page.goto('/')
    await page.getByRole('heading', { name: 'Cup 2026' }).click()

    await expect(page.getByText('ПРО ТУРНІР')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('About Cup 2026')).toBeVisible()
  })

  test('back link returns to home', async ({ page }) => {
    await mockJson(page, /\/tournaments\/list/, mockTournamentListResponse)
    await mockJson(page, /\/tournaments\/t-1/, mockTournamentDetail)
    await mockJson(page, /\/teams\/list/, mockEmptyTeamsList)

    await page.goto('/')
    await page.getByRole('heading', { name: 'Cup 2026' }).click()
    await page.waitForURL(/\/tournaments\/t-1/)
    await expect(page.getByText('ПРО ТУРНІР')).toBeVisible({ timeout: 15000 })
    
    // Ensure the back link is ready to be clicked
    const backLink = page.locator('section.tournament-detail a.back-link')
    await expect(backLink).toBeVisible()
    await backLink.click({ force: true })

    await expect(page.getByRole('heading', { name: 'АКТИВНІ ТУРНІРИ' })).toBeVisible({ timeout: 10000 })
  })
})
