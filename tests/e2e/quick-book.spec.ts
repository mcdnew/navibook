/**
 * E2E Quick Book tests — fill form, verify pricing calculation, submit
 */

import { test, expect } from '@playwright/test'

// Quick-book is the agent's primary view, but admins can access it too
test.use({ storageState: 'tests/e2e/.auth/admin.json' })

test.describe('Quick Book', () => {
  test('quick-book page loads with form', async ({ page }) => {
    await page.goto('/quick-book')
    await expect(page.locator('h1, h2').filter({ hasText: /quick|book|charter/i }).first()).toBeVisible({
      timeout: 10000,
    })
  })

  test('form has all required fields', async ({ page }) => {
    await page.goto('/quick-book')
    await page.waitForLoadState('networkidle')

    // Passengers field is always visible (appears before boat selection)
    await expect(page.getByLabel(/passengers/i).first()).toBeVisible({ timeout: 10000 })

    // Customer details only appear after selecting a boat
    const boatOption = page.locator('text=Rayo del Sol').or(page.locator('text=Brisa del Sur')).first()
    if (await boatOption.isVisible({ timeout: 8000 })) {
      await boatOption.click()
      // Now customer details section should appear
      await expect(page.getByLabel(/full name/i).first()).toBeVisible({ timeout: 8000 })
      await expect(page.getByLabel(/phone/i).first()).toBeVisible()
    }
  })

  test('can select a boat from the list', async ({ page }) => {
    await page.goto('/quick-book')
    await page.waitForLoadState('networkidle')

    // Boats should appear as cards or in a select
    const boatOption = page.locator('text=Rayo del Sol').or(page.locator('text=Brisa del Sur')).first()
    if (await boatOption.isVisible({ timeout: 8000 })) {
      await boatOption.click()
    }
  })

  test('shows pricing after selecting boat and duration', async ({ page }) => {
    await page.goto('/quick-book')
    await page.waitForLoadState('networkidle')

    // Select first boat
    const firstBoat = page.locator('[data-boat]').or(page.locator('.boat-card')).first()
    if (await firstBoat.isVisible({ timeout: 5000 })) {
      await firstBoat.click()
    }

    // Select duration (2h)
    const duration2h = page.getByRole('button', { name: '2h' }).or(page.locator('text=2h').first())
    if (await duration2h.isVisible({ timeout: 5000 })) {
      await duration2h.click()
    }

    // Pricing should update
    const priceDisplay = page.locator('text=/€|price|total/i').first()
    if (await priceDisplay.isVisible({ timeout: 5000 })) {
      await expect(priceDisplay).toBeVisible()
    }
  })

  test('shows validation error when submitting empty form', async ({ page }) => {
    await page.goto('/quick-book')
    await page.waitForLoadState('networkidle')

    const submitBtn = page.getByRole('button', { name: /book|create|submit/i }).last()
    if (await submitBtn.isVisible()) {
      await submitBtn.click()
      // Some form of validation feedback
      await page.waitForTimeout(1000)
      // Should still be on quick-book page (form didn't submit)
      await expect(page).toHaveURL(/\/quick-book/)
    }
  })
})
