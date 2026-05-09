import { defineConfig, devices } from '@playwright/test'
import { env } from 'node:process'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!env.CI,
  retries: env.CI ? 2 : 0,
  reporter: env.CI ? 'github' : 'list',
  use: {
    baseURL: env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4040',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Video needs `pnpm exec playwright install ffmpeg` (or --with-deps). Off by default for fewer deps.
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use the locally installed Chrome to avoid Playwright browser downloads.
        // If you prefer Playwright-managed browsers, remove `channel` and run:
        // `pnpm exec playwright install --with-deps`
        channel: 'chrome',
      },
    },
  ],
  webServer: env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        // `pnpm dev` may hit EMFILE (watchers) on some machines/CI.
        // For E2E, a production server is more stable and deterministic.
        command: 'pnpm build && pnpm preview --port 4040',
        url: 'http://localhost:4040',
        reuseExistingServer: !env.CI,
        timeout: 300_000,
      },
})
