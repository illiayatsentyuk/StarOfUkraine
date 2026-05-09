import { test, expect } from '@playwright/test'

test('about page renders', async ({ page }) => {
  await page.goto('/about')
  await expect(page.getByRole('heading', { name: 'About' })).toBeVisible()
  await expect(page.getByText(/app\/pages\/about\.vue/)).toBeVisible()
})
