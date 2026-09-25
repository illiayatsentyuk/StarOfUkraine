# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tournaments-edit.spec.ts >> tournament edit & validation >> edit form shows validation when name is empty
- Location: tests/e2e/tournaments-edit.spec.ts:30:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Редагувати турнір' })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - status [ref=e4]
  - generic [ref=e5]:
    - banner [ref=e6]:
      - link "STAR OF UKRAINE" [ref=e9] [cursor=pointer]:
        - /url: /
      - generic [ref=e11]:
        - generic:
          - img
        - textbox "Пошук" [ref=e12]:
          - /placeholder: Пошук турніру...
      - generic [ref=e13]:
        - button "СТВОРИТИ ТУРНІР" [ref=e14] [cursor=pointer]:
          - generic [ref=e15]: СТВОРИТИ ТУРНІР
        - button "СТВОРИТИ КОМАНДУ" [ref=e16] [cursor=pointer]:
          - generic [ref=e17]: СТВОРИТИ КОМАНДУ
        - generic [ref=e19]:
          - link:
            - /url: /profile
          - button "ВИЙТИ" [ref=e20] [cursor=pointer]:
            - generic [ref=e21]: 
            - generic [ref=e22]: ВИЙТИ
    - main [ref=e23]:
      - generic [ref=e24]:
        - link "← НАЗАД ДО СПИСКУ" [ref=e26] [cursor=pointer]:
          - /url: /
          - generic [ref=e27]: ←
          - generic [ref=e28]: НАЗАД ДО СПИСКУ
        - generic [ref=e29]:
          - generic [ref=e30]: ОЧІКУВАННЯ
          - heading "Cup 2026" [level=1] [ref=e31]
          - link "Завдання" [ref=e33] [cursor=pointer]:
            - /url: /tournaments/t-1/tasks
            - button "Завдання" [ref=e34]:
              - generic [ref=e35]: Завдання
        - generic [ref=e36]:
          - main [ref=e37]:
            - generic [ref=e38]:
              - heading "ПРО ТУРНІР" [level=3] [ref=e39]
              - paragraph [ref=e40]: About Cup 2026
            - generic [ref=e42]:
              - generic [ref=e43]:
                - generic [ref=e44]: РАУНДІВ
                - generic [ref=e45]: "3"
              - generic [ref=e46]:
                - generic [ref=e47]: ГРАВЦІВ У КОМАНДІ
                - generic [ref=e48]: 2 — 5
              - generic [ref=e49]:
                - generic [ref=e50]: МАКС. КОМАНД
                - generic [ref=e51]: "16"
            - generic [ref=e52]:
              - heading "КОМАНДИ" [level=3] [ref=e53]
              - paragraph [ref=e54]: Команди поки не додані.
          - complementary [ref=e55]:
            - generic [ref=e56]:
              - heading "КЛЮЧОВІ ДАТИ" [level=3] [ref=e57]
              - generic [ref=e58]:
                - generic [ref=e59]:
                  - generic [ref=e60]: РЕЄСТРАЦІЯ ПОЧИНАЄТЬСЯ
                  - generic [ref=e61]: 1 КВІТНЯ 2026
                - generic [ref=e62]:
                  - generic [ref=e63]: РЕЄСТРАЦІЯ ЗАКІНЧУЄТЬСЯ
                  - generic [ref=e64]: 10 ТРАВНЯ 2026
                - generic [ref=e65]:
                  - generic [ref=e66]: ДАТА СТАРТУ
                  - generic [ref=e67]: 15 ЧЕРВНЯ 2026
              - link "↗ ТАБЛИЦЯ РЕЗУЛЬТАТІВ" [ref=e69] [cursor=pointer]:
                - /url: /tournaments/t-1/table
                - generic [ref=e70]: ↗
                - generic [ref=e71]: ТАБЛИЦЯ РЕЗУЛЬТАТІВ
              - generic [ref=e73]:
                - generic [ref=e74]:
                  - generic [ref=e75]: ПОТОЧНИЙ СТАТУС
                  - generic [ref=e76]: ОЧІКУВАННЯ
                - button "Створити команду" [disabled] [ref=e77]:
                  - generic [ref=e78]: 
                  - generic [ref=e79]: Створити команду
```

# Test source

```ts
  1  | import { test, expect, type Page } from '@playwright/test'
  2  | import { mockJson } from './helpers/mock-api'
  3  | import { mockAuthAdmin } from './helpers/mock-auth'
  4  | import { mockTournamentDetailApi } from './helpers/mock-tournament-detail-route'
  5  | import {
  6  |   mockEmptyTeamsList,
  7  |   mockTournamentDetailForEdit,
  8  |   mockTournamentListResponse,
  9  | } from './fixtures/tournaments'
  10 | 
  11 | async function openTournamentDetailAsAdmin(page: Page) {
  12 |   await mockAuthAdmin(page)
  13 |   await mockJson(page, /\/tournaments\/list/, mockTournamentListResponse)
  14 |   await mockTournamentDetailApi(page, { ...mockTournamentDetailForEdit })
  15 |   await mockJson(page, /\/teams\/list/, mockEmptyTeamsList)
  16 | 
  17 |   await page.goto('/')
  18 |   await page.getByRole('heading', { name: 'Cup 2026' }).click()
  19 |   await expect(page.getByText('ПРО ТУРНІР')).toBeVisible()
  20 | }
  21 | 
  22 | test.describe('tournament edit & validation', () => {
  23 |   test('admin can open edit modal', async ({ page }) => {
  24 |     await openTournamentDetailAsAdmin(page)
  25 | 
  26 |     await page.getByRole('button', { name: 'Редагувати турнір' }).click()
  27 |     await expect(page.getByRole('heading', { name: 'РЕДАГУВАТИ ТУРНІР' })).toBeVisible()
  28 |   })
  29 | 
  30 |   test('edit form shows validation when name is empty', async ({ page }) => {
  31 |     await openTournamentDetailAsAdmin(page)
  32 | 
> 33 |     await page.getByRole('button', { name: 'Редагувати турнір' }).click()
     |                                                                   ^ Error: locator.click: Test timeout of 30000ms exceeded.
  34 |     const modal = page.locator('.modal-content')
  35 | 
  36 |     await modal.getByPlaceholder('Введіть назву турніру').fill('')
  37 |     await modal.getByRole('button', { name: 'ЗБЕРЕГТИ' }).click()
  38 | 
  39 |     await expect(modal.getByText("Це поле обов'язкове")).toBeVisible()
  40 |   })
  41 | 
  42 |   test('successful save closes modal and updates title', async ({ page }) => {
  43 |     await openTournamentDetailAsAdmin(page)
  44 | 
  45 |     await page.getByRole('button', { name: 'Редагувати турнір' }).click()
  46 |     const modal = page.locator('.modal-content')
  47 | 
  48 |     await modal.getByPlaceholder('Введіть назву турніру').fill('Cup Renamed')
  49 |     await modal.getByRole('button', { name: 'ЗБЕРЕГТИ' }).click()
  50 | 
  51 |     await expect(page.getByRole('heading', { name: 'РЕДАГУВАТИ ТУРНІР' })).toHaveCount(0)
  52 |     await expect(page.getByRole('heading', { name: 'Cup Renamed' })).toBeVisible()
  53 |   })
  54 | })
  55 | 
```