/**
 * E2E Auth tests — login success, wrong password, logout, role-based redirect
 */

import { test, expect } from '@playwright/test'

test.describe('Login page', () => {
  test('shows NaviBook heading', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'NaviBook' })).toBeVisible()
    await expect(page.getByText('Welcome back')).toBeVisible()
  })

  test('admin login redirects to dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('admin@happysail.es')
    await page.getByLabel('Password').fill('Demo1234!')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.waitForURL('**/dashboard', { timeout: 15000 })
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('captain login redirects to my-bookings', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('captain.javier@happysail.es')
    await page.getByLabel('Password').fill('Demo1234!')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.waitForURL('**/my-bookings', { timeout: 15000 })
    await expect(page).toHaveURL(/\/my-bookings/)
  })

  test('agent login redirects to quick-book', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('agent.marco@happysail.es')
    await page.getByLabel('Password').fill('Demo1234!')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.waitForURL('**/quick-book', { timeout: 15000 })
    await expect(page).toHaveURL(/\/quick-book/)
  })

  test('wrong password shows error', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('admin@happysail.es')
    await page.getByLabel('Password').fill('WrongPassword999!')
    await page.getByRole('button', { name: 'Sign in' }).click()
    // Error message should appear and stay on login page
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
    // Some form of error feedback
    await expect(page.locator('text=/invalid|incorrect|error/i')).toBeVisible({ timeout: 5000 })
  })

  test('protected route redirects unauthenticated user to login', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL('**/login', { timeout: 10000 })
    await expect(page).toHaveURL(/\/login/)
  })
})
