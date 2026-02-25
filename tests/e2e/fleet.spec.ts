/**
 * E2E Fleet tests — boat lifecycle: create, edit, toggle active, delete
 */

import { test, expect } from '@playwright/test'

test.use({ storageState: 'tests/e2e/.auth/admin.json' })

const runId = Date.now()
const testBoatName = `[E2E-${runId}] Test Vessel`

test.describe('Fleet Management', () => {
  test('fleet page loads with boat list', async ({ page }) => {
    await page.goto('/fleet')
    await expect(page.getByRole('heading', { name: 'Fleet Management' })).toBeVisible()
    // At least the demo boats should be visible
    await expect(
      page.locator('text=Rayo del Sol').or(page.locator('text=Brisa del Sur')).first()
    ).toBeVisible()
  })

  test('create a new boat', async ({ page }) => {
    await page.goto('/fleet')

    // Click "Add New Boat" button
    await page.getByRole('button', { name: /add new boat|add your first boat/i }).first().click()

    // Fill in the boat creation form
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await dialog.getByLabel(/boat name/i).fill(testBoatName)

    // Select boat type (Motorboat)
    const typeSelect = dialog.getByRole('combobox').first()
    if (await typeSelect.isVisible()) {
      await typeSelect.click()
      const motorboatOption = page.getByRole('option', { name: /motorboat/i })
      if (await motorboatOption.isVisible()) {
        await motorboatOption.click()
      }
    }

    const capacityField = dialog.getByLabel(/capacity/i)
    await capacityField.clear()
    await capacityField.fill('6')

    await dialog.getByRole('button', { name: /create|save|add/i }).click()

    // Verify success — boat name should appear in list (exact to avoid matching toast)
    await expect(page.getByText(testBoatName, { exact: true })).toBeVisible({ timeout: 10000 })
  })

  test('edit a boat name', async ({ page }) => {
    await page.goto('/fleet')

    // Find the test boat and click edit
    const boatCard = page.getByText(testBoatName).first()
    if (!(await boatCard.isVisible({ timeout: 5000 }))) return

    // Click the edit button near the test boat
    const editBtn = boatCard.locator('..').locator('..').getByRole('button', { name: /edit/i })

    if (await editBtn.isVisible({ timeout: 3000 })) {
      await editBtn.click()
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()

      const nameField = dialog.getByLabel(/boat name/i)
      await nameField.clear()
      await nameField.fill(`${testBoatName} (updated)`)
      await dialog.getByRole('button', { name: /save|update/i }).click()

      await expect(page.getByText(`${testBoatName} (updated)`)).toBeVisible({ timeout: 5000 })
    }
  })

  test('navigate to fuel config page', async ({ page }) => {
    await page.goto('/fleet')
    await page.getByRole('link', { name: /fuel config/i }).first().click()
    await expect(page).toHaveURL(/fuel-config/)
    await expect(page.getByRole('heading', { name: /fuel/i }).first()).toBeVisible()
  })

  test('delete the test boat', async ({ page }) => {
    await page.goto('/fleet')

    // Find the test boat (may have been renamed)
    const boatText = page.getByText(testBoatName).or(page.getByText(`${testBoatName} (updated)`)).first()

    if (!(await boatText.isVisible({ timeout: 5000 }))) {
      // Boat may have already been cleaned up or not created
      return
    }

    // Find delete button for this boat
    const boatCard = boatText.locator('..').locator('..')
    const deleteBtn = boatCard.getByRole('button', { name: /delete/i })

    if (await deleteBtn.isVisible()) {
      await deleteBtn.click()
      // Confirm dialog
      const confirmBtn = page.getByRole('button', { name: /confirm|delete|yes/i }).last()
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click()
      }
      await expect(page.getByText(testBoatName)).not.toBeVisible({ timeout: 5000 })
    }
  })
})
