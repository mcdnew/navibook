import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: 'list',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    // Auth setup runs first
    {
      name: 'setup',
      testMatch: '**/fixtures/auth.setup.ts',
    },
    // Admin tests
    {
      name: 'admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
      testIgnore: ['**/auth.spec.ts', '**/captain-view.spec.ts'],
    },
    // Auth tests (no storageState - tests login itself)
    {
      name: 'no-auth',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/auth.spec.ts',
      dependencies: ['setup'],
    },
    // Captain tests
    {
      name: 'captain',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/captain.json',
      },
      dependencies: ['setup'],
      testMatch: '**/captain-view.spec.ts',
    },
  ],
})
