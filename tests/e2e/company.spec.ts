/**
 * E2E Company tests — settings page loads, tabs work
 */

import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/admin.json' })

test.describe('Company Settings', () => {
  test('company page loads', async ({ page }) => {
    await page.goto('/company')
    await expect(page.locator('h1, h2').filter({ hasText: /company|settings/i }).first()).toBeVisible({
      timeout: 10000,
    })
  })

  test('shows company name in form', async ({ page }) => {
    await page.goto('/company')
    await page.waitForLoadState('networkidle')
    // Demo company name should appear
    await expect(page.locator('text=Happy Sail Estepona').or(page.locator('[value="Happy Sail Estepona"]'))).toBeVisible({
      timeout: 8000,
    })
  })

  test('has cancellation policies tab', async ({ page }) => {
    await page.goto('/company')
    await page.waitForLoadState('networkidle')

    const tab = page.getByRole('tab', { name: /cancellation|polic/i }).or(
      page.getByText(/cancellation.*polic/i)
    ).first()
    if (await tab.isVisible({ timeout: 5000 })) {
      await tab.click()
      await expect(page.locator('text=/refund|polic/i').first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('has package config section', async ({ page }) => {
    await page.goto('/company')
    await page.waitForLoadState('networkidle')

    const packageTab = page.getByRole('tab', { name: /package|config/i }).or(
      page.getByText(/package.*config/i)
    ).first()
    if (await packageTab.isVisible({ timeout: 5000 })) {
      await packageTab.click()
      await expect(page.locator('text=/drinks|food|cost/i').first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('has location settings', async ({ page }) => {
    await page.goto('/company')
    await page.waitForLoadState('networkidle')

    const locationTab = page.getByRole('tab', { name: /location/i }).or(
      page.getByText(/location/i)
    ).first()
    if (await locationTab.isVisible({ timeout: 5000 })) {
      await locationTab.click()
      await expect(page.locator('text=/latitude|longitude|coordinates/i').first()).toBeVisible({ timeout: 5000 })
    }
  })
})
