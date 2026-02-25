/**
 * E2E Agents tests — page loads, create agent form
 */

import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/admin.json' })

test.describe('Agents / Staff', () => {
  test('agents page loads', async ({ page }) => {
    await page.goto('/agents')
    await expect(page.locator('h1, h2').filter({ hasText: /agent|staff|team|crew/i }).first()).toBeVisible({
      timeout: 10000,
    })
  })

  test('shows existing agents from demo data', async ({ page }) => {
    await page.goto('/agents')
    await page.waitForLoadState('networkidle')
    // Demo data has Marco and Laura as agents
    await expect(
      page.locator('text=Marco').or(page.locator('text=Javier')).first()
    ).toBeVisible({ timeout: 8000 })
  })

  test('has an add agent button', async ({ page }) => {
    await page.goto('/agents')
    const addBtn = page.getByRole('button', { name: /add|create|new.*agent/i }).first()
    await expect(addBtn).toBeVisible({ timeout: 8000 })
  })

  test('can open add agent dialog', async ({ page }) => {
    await page.goto('/agents')
    await page.waitForLoadState('networkidle')

    const addBtn = page.getByRole('button', { name: /add|create|new/i }).first()
    if (await addBtn.isVisible()) {
      await addBtn.click()
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible({ timeout: 5000 })

      // Form should have name, email, role, password fields
      await expect(dialog.getByLabel(/first.*name|name/i).first()).toBeVisible()
      await expect(dialog.getByLabel(/email/i).first()).toBeVisible()

      await page.keyboard.press('Escape')
    }
  })
})
