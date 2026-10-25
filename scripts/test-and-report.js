#!/usr/bin/env node
/**
 * Runs the suite, then always builds the PDF summary — including after
 * failures, which is when it matters most. Exits with the test run's code.
 *
 * Usage: npm run test:report [-- <any playwright test args>]
 */
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const playwrightCli = createRequire(import.meta.url).resolve('@playwright/test/cli');
// Invoke node directly (no shell) so arguments pass through unchanged on every OS.
const run = (...args) => spawnSync(process.execPath, args, { stdio: 'inherit' }).status ?? 1;

const testStatus = run(playwrightCli, 'test', ...process.argv.slice(2));
const pdfStatus = run('scripts/generate-pdf-report.js');

process.exit(testStatus || pdfStatus);
