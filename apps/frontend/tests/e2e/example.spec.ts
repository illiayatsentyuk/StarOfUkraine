import { test, expect } from '@playwright/test'
import { mockJson } from './helpers/mock-api'

test('home shows tournaments from API', async ({ page }) => {
  await mockJson(page, /\/tournaments\/list/, {
    data: [
      {
        id: 't-1',
        name: 'Cup 2026',
        description: 'Demo tournament',
        startDate: '2026-05-01T00:00:00.000Z',
        maxTeams: 16,
        status: 'DRAFT',
      },
    ],
    totalPages: 1,
  })

  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'НАЙБЛИЖЧІ ТУРНІРИ' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Cup 2026' })).toBeVisible()
})

test('tournament card navigates to detail page', async ({ page }) => {
  await mockJson(page, /\/tournaments\/list/, {
    data: [
      {
        id: 't-1',
        name: 'Cup 2026',
        description: 'Demo tournament',
        startDate: '2026-05-01T00:00:00.000Z',
        maxTeams: 16,
        status: 'DRAFT',
      },
    ],
    totalPages: 1,
  })

  await mockJson(page, /\/tournaments\/t-1$/, {
    id: 't-1',
    name: 'Cup 2026',
    description: 'About Cup 2026',
    rounds: 3,
    teamSizeMin: 1,
    teamSizeMax: 5,
    maxTeams: 16,
    status: 'DRAFT',
    hideTeamsUntilRegistrationEnds: false,
    registrationEnd: '2020-01-01T00:00:00.000Z',
  })

  await mockJson(page, /\/teams\/list/, {
    data: [],
    totalPages: 0,
  })

  await page.goto('/')
  await page.getByRole('heading', { name: 'Cup 2026' }).click()

  await expect(page.getByText('ПРО ТУРНІР')).toBeVisible()
  await expect(page.getByText('About Cup 2026')).toBeVisible()
})
