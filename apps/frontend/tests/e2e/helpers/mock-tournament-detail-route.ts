import type { Page } from '@playwright/test'

/** Handle GET (load) and PATCH (update) for `/tournaments/:id` without conflating methods. */
export async function mockTournamentDetailApi(
  page: Page,
  detail: Record<string, unknown>,
) {
  await page.route(/\/tournaments\/t-1$/, async (route) => {
    const method = route.request().method()
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(detail),
      })
      return
    }
    if (method === 'PATCH') {
      let patch: Record<string, unknown> = {}
      try {
        const raw = route.request().postData()
        if (raw) patch = JSON.parse(raw) as Record<string, unknown>
      } catch {
        /* ignore */
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...detail, ...patch, id: detail.id ?? 't-1' }),
      })
      return
    }
    await route.continue()
  })
}
