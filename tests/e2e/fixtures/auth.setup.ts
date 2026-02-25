/**
 * Auth setup: logs in as admin, captain, and agent once.
 * Saves storageState (cookies) so tests don't need to login.
 */

import { test as setup, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const AUTH_DIR = path.join(__dirname, '../.auth')

// Ensure auth directory exists
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true })
}

const ADMIN_FILE = path.join(AUTH_DIR, 'admin.json')
const CAPTAIN_FILE = path.join(AUTH_DIR, 'captain.json')
const AGENT_FILE = path.join(AUTH_DIR, 'agent.json')

async function loginAs(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
  storageFile: string
) {
  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()

  // Wait for redirect away from login
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 })
  await page.context().storageState({ path: storageFile })
}

setup('authenticate as admin', async ({ page }) => {
  await loginAs(page, 'admin@happysail.es', 'Demo1234!', ADMIN_FILE)
})

setup('authenticate as captain', async ({ page }) => {
  await loginAs(page, 'captain.javier@happysail.es', 'Demo1234!', CAPTAIN_FILE)
})

setup('authenticate as agent', async ({ page }) => {
  await loginAs(page, 'agent.marco@happysail.es', 'Demo1234!', AGENT_FILE)
})
