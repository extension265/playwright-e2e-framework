// @ts-check
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import { env } from './config/env.js';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: env.isCI,
  // Retries are opt-in per project (see "api" below) — UI flakiness should be fixed, not retried.
  retries: 0,
  workers: env.isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  // CI shards emit blob reports that a later job merges (see merge.config.js);
  // locally you get the HTML report plus the JSON the PDF generator reads.
  reporter: env.isCI
    ? [['blob'], ['github'], ['list']]
    : [['list'], ['html', { open: 'never' }], ['json', { outputFile: path.join(env.reportsDir, 'results.json') }]],
  use: {
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // ── Setup: authenticate once, hand state to the dependent projects ─────
    {
      name: 'setup-ui',
      testMatch: /ui\.setup\.js/,
      use: { ...devices['Desktop Chrome'], baseURL: env.uiBaseUrl },
    },
    {
      name: 'setup-api',
      testMatch: /api\.setup\.js/,
      retries: env.isCI ? 2 : 0,
    },

    // ── Suites ─────────────────────────────────────────────────────────────
    {
      name: 'ui',
      testDir: './tests/ui',
      dependencies: ['setup-ui'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: env.uiBaseUrl,
        storageState: env.uiStorageState,
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
      dependencies: ['setup-api'],
      // The public API is a shared free-tier dyno: cold starts and resets cause
      // transient failures that are not product bugs, so only this project retries.
      retries: env.isCI ? 2 : 0,
    },
  ],
});
