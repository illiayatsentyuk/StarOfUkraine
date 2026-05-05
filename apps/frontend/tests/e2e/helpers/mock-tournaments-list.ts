import type { Page } from '@playwright/test'

const draft = {
  id: 't-draft',
  name: 'Draft Cup',
  description: 'Draft only',
  startDate: '2026-05-01T00:00:00.000Z',
  maxTeams: 8,
  status: 'DRAFT',
}

const ongoing = {
  id: 't-live',
  name: 'Live Cup',
  description: 'Live now',
  startDate: '2026-06-01T00:00:00.000Z',
  maxTeams: 16,
  status: 'ONGOING',
}

/**
 * Intercepts `POST …/tournaments/list` and returns a list that depends on the JSON body’s `status`.
 *
 * - `await page.route(...)` finishes as soon as the handler is **registered** (not when requests run).
 * - The inner `async (route) => { … }` runs **once per matching request**; each call must end in
 *   `fulfill` or `continue`, or the request will hang.
 * - Non-POST matches (e.g. CORS `OPTIONS`) are passed through with `continue()` so the browser can
 *   complete the real preflight against `apiURL` if needed.
 */
export async function mockTournamentsListWithStatusFilter(page: Page) {
  await page.route(/\/tournaments\/list/, async (route) => {
    const req = route.request()
    if (req.method() !== 'POST') {
      await route.continue()
      return
    }

    let status: string | undefined
    try {
      const json = req.postDataJSON() as { status?: string } | null
      status = json?.status
    } catch {
      /* ignore malformed body */
    }

    const body =
      status === 'ONGOING'
        ? { data: [ongoing], totalPages: 1 }
        : { data: [draft, ongoing], totalPages: 1 }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    })
  })
}
