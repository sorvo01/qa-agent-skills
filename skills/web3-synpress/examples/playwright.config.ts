import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  workers: 1,                  // one wallet, one chain: keep transactions in order
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
