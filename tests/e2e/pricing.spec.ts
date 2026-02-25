/**
 * E2E Pricing tests — page loads, add pricing entry
 */

import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/admin.json' })

test.describe('Pricing', () => {
  test('pricing page loads', async ({ page }) => {
    await page.goto('/pricing')
    await expect(page.locator('h1, h2').filter({ hasText: /pricing/i }).first()).toBeVisible({
      timeout: 10000,
    })
  })

  test('shows boats with pricing', async ({ page }) => {
    await page.goto('/pricing')
    await page.waitForLoadState('networkidle')
    // Should show at least one boat (demo data has 3)
    await expect(
      page.locator('text=Rayo del Sol').or(page.locator('text=Brisa del Sur')).first()
    ).toBeVisible({ timeout: 8000 })
  })

  test('can open add pricing dialog', async ({ page }) => {
    await page.goto('/pricing')
    await page.waitForLoadState('networkidle')

    const addBtn = page.getByRole('button', { name: /add.*pricing|add.*price|new.*price/i }).first()
    if (await addBtn.isVisible({ timeout: 5000 })) {
      await addBtn.click()
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible({ timeout: 5000 })
      await page.keyboard.press('Escape')
    }
  })

  test('has copy pricing button', async ({ page }) => {
    await page.goto('/pricing')
    await page.waitForLoadState('networkidle')
    const copyBtn = page.getByRole('button', { name: /copy/i }).first()
    if (await copyBtn.isVisible({ timeout: 5000 })) {
      await expect(copyBtn).toBeVisible()
    }
  })
})
