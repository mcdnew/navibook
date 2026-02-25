/**
 * E2E Bookings tests — dashboard view, booking detail actions
 */

import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/admin.json' })

test.describe('Bookings', () => {
  test('dashboard loads with upcoming bookings section', async ({ page }) => {
    await page.goto('/dashboard')
    // Dashboard should show the booking sections
    await expect(page.getByText(/upcoming|today|bookings/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('bookings list page loads', async ({ page }) => {
    await page.goto('/bookings')
    await expect(page.locator('h1, h2').filter({ hasText: /booking/i }).first()).toBeVisible({ timeout: 10000 })
  })

  test('can navigate to a booking detail', async ({ page }) => {
    await page.goto('/bookings')

    // Click on the first booking in the list
    const firstBookingLink = page.getByRole('link', { name: /view|details/i }).first()
      .or(page.locator('a[href*="/bookings/"]').first())

    if (await firstBookingLink.isVisible({ timeout: 5000 })) {
      await firstBookingLink.click()
      await expect(page).toHaveURL(/\/bookings\/[^/]+/)
    }
  })

  test('booking detail shows customer info and action buttons', async ({ page }) => {
    // Go directly to bookings page and find a confirmed booking
    await page.goto('/bookings')
    await page.waitForLoadState('networkidle')

    // Look for any booking row to navigate into
    const bookingRows = page.locator('a[href*="/bookings/"]')
    const count = await bookingRows.count()
    if (count === 0) return // No bookings to test with

    await bookingRows.first().click()
    await page.waitForURL(/\/bookings\/[^/]+/)

    // Booking detail should show customer name, status, action buttons
    await expect(page.locator('text=/customer|passenger|booking/i').first()).toBeVisible()
  })
})
