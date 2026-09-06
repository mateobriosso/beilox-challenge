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
  ? [
      ['github'],
      ['blob'],
      ['json', { outputFile: 'test-results/results.json' }],
      ['junit', { outputFile: 'test-results/junit.xml' }],
      ['./src/reporters/response-time.reporter.ts'],
    ]
  : [['list'], ['html', { open: 'never' }], ['./src/reporters/response-time.reporter.ts']],
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
      // The public site renders results server-side after a redirect (several seconds),
      // and a full search walks Select2 + calendar + submit before asserting.
      timeout: 90_000,
      expect: { timeout: 20_000 },
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
