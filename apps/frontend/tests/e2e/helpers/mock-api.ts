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

