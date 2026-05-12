import { test, expect, type Page } from '@playwright/test'
import { mockJson } from './helpers/mock-api'
import { mockAuthAdmin } from './helpers/mock-auth'
import { mockTournamentDetailApi } from './helpers/mock-tournament-detail-route'
import {
  mockEmptyTeamsList,
  mockTournamentDetailForEdit,
  mockTournamentListResponse,
} from './fixtures/tournaments'

async function openTournamentDetailAsAdmin(page: Page) {
  await mockAuthAdmin(page)
  await mockJson(page, /\/tournaments\/list/, mockTournamentListResponse)
  await mockTournamentDetailApi(page, { ...mockTournamentDetailForEdit })
  await mockJson(page, /\/teams\/list/, mockEmptyTeamsList)

  await page.goto('/')
  // Wait for auth to initialize (increased timeout for stability)
  await expect(page.getByTestId('user-email')).toBeVisible({ timeout: 15000 })
  
  await page.getByRole('heading', { name: 'Cup 2026' }).click()
  await expect(page.getByText('ПРО ТУРНІР')).toBeVisible()
}

test.describe('tournament edit & validation', () => {
  test('admin can open edit modal', async ({ page }) => {
    await openTournamentDetailAsAdmin(page)

    await page.getByTestId('edit-tournament-btn').click()
    await expect(page.getByRole('heading', { name: 'РЕДАГУВАТИ ТУРНІР' })).toBeVisible()
  })

  test('edit form shows validation when name is empty', async ({ page }) => {
    await openTournamentDetailAsAdmin(page)

    await page.getByTestId('edit-tournament-btn').click()
    const modal = page.locator('.modal-content')

    await modal.getByPlaceholder('Введіть назву турніру').fill('')
    await modal.getByRole('button', { name: 'ЗБЕРЕГТИ' }).click()

    await expect(modal.getByText("Це поле обов'язкове")).toBeVisible()
  })

  test('successful save closes modal and updates title', async ({ page }) => {
    await openTournamentDetailAsAdmin(page)

    await page.getByTestId('edit-tournament-btn').click()
    const modal = page.locator('.modal-content')

    await modal.getByPlaceholder('Введіть назву турніру').fill('Cup Renamed')
    await modal.getByRole('button', { name: 'ЗБЕРЕГТИ' }).click()

    await expect(page.getByRole('heading', { name: 'РЕДАГУВАТИ ТУРНІР' })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Cup Renamed' })).toBeVisible()
  })
})
