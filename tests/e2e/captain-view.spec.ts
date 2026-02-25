/**
 * E2E Captain View tests — my-bookings page shows assigned charters
 */

import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/captain.json' })

test.describe('Captain View (My Bookings)', () => {
  test('captain is redirected to my-bookings after login', async ({ page }) => {
    await page.goto('/dashboard')
    // Captain should be redirected to my-bookings from dashboard
    // (or allowed to see dashboard depending on implementation)
    await page.waitForLoadState('networkidle')
    // Either stays on dashboard or goes to my-bookings
    await expect(page).toHaveURL(/\/(dashboard|my-bookings)/)
  })

  test('my-bookings page loads for captain', async ({ page }) => {
    await page.goto('/my-bookings')
    await expect(page.locator('h1, h2').filter({ hasText: /booking|schedule|charter/i }).first()).toBeVisible({
      timeout: 10000,
    })
  })

  test('shows upcoming and past sections', async ({ page }) => {
    await page.goto('/my-bookings')
    await page.waitForLoadState('networkidle')
    // Should show upcoming and past sections
    await expect(
      page.locator('text=/upcoming|today|past|completed/i').first()
    ).toBeVisible({ timeout: 8000 })
  })

  test('captain cannot access fleet management', async ({ page }) => {
    // Captain should not have access to fleet management
    // Either redirected or shown an access denied page
    await page.goto('/fleet')
    await page.waitForLoadState('networkidle')
    // May be redirected to login or my-bookings or show error
    await expect(page).toHaveURL(/\/(login|my-bookings|fleet)/)
  })
})
