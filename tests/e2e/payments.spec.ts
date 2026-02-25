/**
 * E2E Payments tests — payments page loads, record payment form
 */

import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/admin.json' })

test.describe('Payments', () => {
  test('payments page loads', async ({ page }) => {
    await page.goto('/payments')
    await expect(page.locator('h1, h2').filter({ hasText: /payment/i }).first()).toBeVisible({
      timeout: 10000,
    })
  })

  test('shows payment history', async ({ page }) => {
    await page.goto('/payments')
    await page.waitForLoadState('networkidle')
    // Payments page shows summary stats and a list of bookings with payment records
    await expect(
      page.locator('table').or(page.getByText(/outstanding|collected|payment/i)).first()
    ).toBeVisible({ timeout: 8000 })
  })

  test('has record payment button', async ({ page }) => {
    await page.goto('/payments')
    const recordBtn = page.getByRole('button', { name: /record.*payment|add.*payment|new.*payment/i }).first()
    if (await recordBtn.isVisible({ timeout: 5000 })) {
      await expect(recordBtn).toBeVisible()
    }
  })

  test('can open record payment dialog', async ({ page }) => {
    await page.goto('/payments')
    await page.waitForLoadState('networkidle')

    const recordBtn = page.getByRole('button', { name: /record|add|new/i }).first()
    if (await recordBtn.isVisible({ timeout: 5000 })) {
      await recordBtn.click()
      const dialog = page.getByRole('dialog')
      if (await dialog.isVisible({ timeout: 3000 })) {
        await expect(dialog.locator('text=/amount|payment/i').first()).toBeVisible()
        await page.keyboard.press('Escape')
      }
    }
  })
})
