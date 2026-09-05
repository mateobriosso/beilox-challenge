import { defineConfig, devices } from '@playwright/test';
import { env } from './src/utils/env';

const isCI = env.isCI;

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
        baseURL: env.apiBaseUrl,
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
        baseURL: env.uiBaseUrl,
        locale: 'es-AR',
        timezoneId: 'America/Argentina/Buenos_Aires',
        video: 'retain-on-failure',
      },
    },
  ],
});
