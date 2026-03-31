/**
 * E2E tests for /settings/api-keys — Partner API Key Management UI
 */

import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/admin.json' })

test.describe('API Keys Settings', () => {
  test('page loads and shows heading', async ({ page }) => {
    await page.goto('/settings/api-keys')
    await expect(page.getByRole('heading', { name: /partner api keys/i })).toBeVisible({ timeout: 10000 })
  })

  test('shows Generate New Key button', async ({ page }) => {
    await page.goto('/settings/api-keys')
    await expect(page.getByRole('button', { name: /generate new key/i })).toBeVisible({ timeout: 8000 })
  })

  test('shows the API keys table with expected columns', async ({ page }) => {
    await page.goto('/settings/api-keys')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('columnheader', { name: /name/i })).toBeVisible({ timeout: 8000 })
    await expect(page.getByRole('columnheader', { name: /webhook/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /status/i })).toBeVisible()
  })

  test('can open Generate New Key dialog', async ({ page }) => {
    await page.goto('/settings/api-keys')
    await page.getByRole('button', { name: /generate new key/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
    await expect(page.getByLabel(/key name/i)).toBeVisible()
  })

  test('Generate Key button disabled when name is empty', async ({ page }) => {
    await page.goto('/settings/api-keys')
    await page.getByRole('button', { name: /generate new key/i }).click()
    await expect(page.getByRole('button', { name: /^generate key$/i })).toBeDisabled({ timeout: 5000 })
  })

  test('can create a new API key and see the raw key', async ({ page }) => {
    await page.goto('/settings/api-keys')
    await page.getByRole('button', { name: /generate new key/i }).click()
    await page.getByLabel(/key name/i).fill('E2E Test Key')
    await page.getByRole('button', { name: /^generate key$/i }).click()

    // Should show the raw key with copy button
    await expect(page.getByText(/save this key/i)).toBeVisible({ timeout: 8000 })
    const keyInput = page.locator('input[readonly]').first()
    await expect(keyInput).toBeVisible()
    const rawKey = await keyInput.inputValue()
    expect(rawKey.length).toBeGreaterThan(20)

    // Close the dialog
    await page.getByRole('button', { name: /done/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('newly created key appears in table as Active', async ({ page }) => {
    await page.goto('/settings/api-keys')
    await page.getByRole('button', { name: /generate new key/i }).click()
    await page.getByLabel(/key name/i).fill('E2E Visible Key')
    await page.getByRole('button', { name: /^generate key$/i }).click()
    await page.getByRole('button', { name: /done/i }).click()

    // The key name should appear in the table
    await expect(page.getByRole('cell', { name: 'E2E Visible Key' }).first()).toBeVisible({ timeout: 8000 })
    // And it should have an Active badge
    const row = page.getByRole('row').filter({ hasText: 'E2E Visible Key' }).first()
    await expect(row.getByText('Active')).toBeVisible()
  })

  test('can open webhook dialog for an active key', async ({ page }) => {
    await page.goto('/settings/api-keys')
    await page.waitForLoadState('networkidle')

    // Find any active key row with a Webhook button
    const webhookBtn = page.getByRole('button', { name: /webhook/i }).first()
    if (await webhookBtn.isVisible({ timeout: 5000 })) {
      await webhookBtn.click()
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
      await expect(page.getByLabel(/endpoint url/i)).toBeVisible()
      await expect(page.getByText(/booking\.confirmed/)).toBeVisible()
      // Close
      await page.getByRole('button', { name: /cancel/i }).click()
    }
  })

  test('can set a webhook URL', async ({ page }) => {
    await page.goto('/settings/api-keys')
    await page.waitForLoadState('networkidle')

    const webhookBtn = page.getByRole('button', { name: /webhook/i }).first()
    if (await webhookBtn.isVisible({ timeout: 5000 })) {
      await webhookBtn.click()
      await page.getByLabel(/endpoint url/i).fill('https://example.com/webhooks/test')
      await page.getByRole('button', { name: /^save$/i }).click()
      // Dialog should close on success
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 8000 })
      // URL should appear (truncated) in the table
      await expect(page.getByText(/example\.com/).first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('can revoke a key after confirmation', async ({ page }) => {
    // Create a dedicated key to revoke
    await page.goto('/settings/api-keys')
    await page.getByRole('button', { name: /generate new key/i }).click()
    await page.getByLabel(/key name/i).fill('E2E Revoke Me')
    await page.getByRole('button', { name: /^generate key$/i }).click()
    await page.getByRole('button', { name: /done/i }).click()

    // Find the row and click Revoke
    const row = page.getByRole('row').filter({ hasText: 'E2E Revoke Me' }).first()
    await row.getByRole('button', { name: /revoke/i }).click()
    // Confirm button should appear
    await row.getByRole('button', { name: /confirm/i }).click()

    // Row status should change to Revoked
    await expect(row.getByText('Revoked')).toBeVisible({ timeout: 8000 })
  })

  test('cancel button dismisses revoke confirmation', async ({ page }) => {
    await page.goto('/settings/api-keys')
    await page.waitForLoadState('networkidle')

    // Find any active row
    const revokeBtn = page.getByRole('button', { name: /^revoke$/i }).first()
    if (await revokeBtn.isVisible({ timeout: 5000 })) {
      await revokeBtn.click()
      await expect(page.getByRole('button', { name: /confirm/i }).first()).toBeVisible()
      await page.getByRole('button', { name: /^cancel$/i }).first().click()
      await expect(page.getByRole('button', { name: /^revoke$/i }).first()).toBeVisible({ timeout: 3000 })
    }
  })

  test('Back to Settings link works', async ({ page }) => {
    await page.goto('/settings/api-keys')
    await page.getByRole('link', { name: /back to settings/i }).click()
    await expect(page).toHaveURL(/\/settings$/, { timeout: 5000 })
  })
})
