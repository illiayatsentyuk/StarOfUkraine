import type { Page } from '@playwright/test'
import { mockJson } from './mock-api'

/** `app.vue` calls `POST /auth/me` on load; admin unlocks tournament edit UI. */
export async function mockAuthAdmin(page: Page) {
  await mockJson(page, /\/auth\/me/, {
    id: 'e2e-admin',
    email: 'e2e-admin@example.com',
    role: 'ADMIN',
  })
}
