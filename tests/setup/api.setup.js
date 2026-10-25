import { test as setup, expect } from '../../src/fixtures/index.js';
import { env } from '../../config/env.js';
import { dataStore } from '../../src/utils/dataStore.js';

// Fetches one admin token per run and hands it to the "api" project via the
// data store — the API equivalent of saving a browser storageState.
setup('authenticate API admin', async ({ authApi }) => {
  const { status, body } = await authApi.createToken(env.apiCredentials);

  expect(status).toBe(200);
  expect(body, 'check API_USERNAME / API_PASSWORD').toHaveProperty('token');

  dataStore.set('apiToken', body.token);
});
