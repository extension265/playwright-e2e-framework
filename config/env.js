import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ENV_FILE selects the environment file (default: .env). dotenv never overrides
// variables already present in the shell, so CI secrets take precedence.
dotenv.config({ path: path.resolve(rootDir, process.env.ENV_FILE || '.env'), quiet: true });

function required(name) {
  const value = process.env[name];
  if (!value || value.startsWith('<')) {
    throw new Error(
      `Missing environment variable "${name}". Copy .env.example to .env and fill it in, ` +
        'or set it in the shell / CI secrets.',
    );
  }
  return value;
}

/**
 * Single source of runtime configuration. Everything environment-specific is
 * read here — nothing else in the framework touches process.env for config.
 * Credentials are resolved lazily so that suites which don't need them
 * (e.g. API-only runs) don't fail on unrelated missing variables.
 */
export const env = Object.freeze({
  rootDir,
  isCI: !!process.env.CI,
  uiStorageState: path.join(rootDir, '.auth', 'ui-user.json'),
  runtimeDir: path.join(rootDir, '.runtime'),
  reportsDir: path.join(rootDir, 'reports'),
  uiBaseUrl: process.env.UI_BASE_URL || 'https://www.saucedemo.com',
  apiBaseUrl: process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com',
  get uiCredentials() {
    return { username: required('UI_USERNAME'), password: required('UI_PASSWORD') };
  },
  get apiCredentials() {
    return { username: required('API_USERNAME'), password: required('API_PASSWORD') };
  },
});
