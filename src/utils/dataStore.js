import fs from 'node:fs';
import path from 'node:path';
import { env } from '../../config/env.js';

/**
 * File-backed key/value store for handing values from a setup project to the
 * tests that depend on it (e.g. an API token). One file per key, so parallel
 * setup projects never race on the same file.
 *
 * Scope rule: setup writes, tests read. Tests never write here — every test
 * creates the data it needs, so any test can run alone and in any order.
 */
export const dataStore = {
  set(key, value) {
    fs.mkdirSync(env.runtimeDir, { recursive: true });
    fs.writeFileSync(fileFor(key), JSON.stringify(value, null, 2));
  },

  get(key) {
    try {
      return JSON.parse(fs.readFileSync(fileFor(key), 'utf8'));
    } catch {
      throw new Error(
        `"${key}" is not in the data store. It is written by a setup project — run tests ` +
          'through their project (e.g. --project=api) so dependencies run, and avoid --no-deps.',
      );
    }
  },
};

function fileFor(key) {
  return path.join(env.runtimeDir, `${key}.json`);
}
