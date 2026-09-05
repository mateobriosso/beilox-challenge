import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load local overrides from `.env` (git-ignored). CI injects real env vars instead.
dotenv.config({ quiet: true });

const isCI = Boolean(process.env.CI);

const API_BASE_URL = process.env.API_BASE_URL ?? 'https://www.swapi.tech';
const UI_BASE_URL = process.env.BASE_URL ?? 'https://www.centraldepasajes.com.ar';

export default defineConfig({
  fullyParallel: true,
  forbidOnly: isCI,
  // Omit locally so Playwright picks its default (half the CPU cores);
  // `exactOptionalPropertyTypes` forbids an explicit `undefined`.
  ...(isCI ? { workers: 2 } : {}),
  reporter: isCI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  snapshotDir: './snapshots',

  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      retries: 0,
      use: {
        baseURL: API_BASE_URL,
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    },
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      retries: isCI ? 1 : 0,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: UI_BASE_URL,
        locale: 'es-AR',
        timezoneId: 'America/Argentina/Buenos_Aires',
        video: 'retain-on-failure',
      },
    },
  ],
});
