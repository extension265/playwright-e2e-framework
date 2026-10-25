#!/usr/bin/env node
/**
 * Builds a one-file PDF summary of a Playwright run, for people who won't open
 * the interactive HTML report (managers, release sign-off, ticket attachments).
 *
 * Input is Playwright's JSON reporter output — a documented, stable format —
 * so it works for local runs and for sharded CI runs merged with
 * `playwright merge-reports --reporter json`.
 *
 * Usage: node scripts/generate-pdf-report.js [--input reports/results.json] [--output reports/test-summary.pdf] [--html reports/test-summary.html]
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from '@playwright/test';

const { values: args } = parseArgs({
  options: {
    input: { type: 'string', default: 'reports/results.json' },
    output: { type: 'string', default: 'reports/test-summary.pdf' },
    title: { type: 'string', default: 'Test Execution Report' },
    html: { type: 'string' }, // optional: also write the source HTML here
  },
});

const OUTCOME = { expected: 'passed', unexpected: 'failed', flaky: 'flaky', skipped: 'skipped' };
// Terminal colour codes (ESC[...m) that Playwright embeds in error messages.
const ANSI_COLOURS = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

async function main() {
  if (!fs.existsSync(args.input)) {
    throw new Error(`No JSON results at ${args.input}. Run "npx playwright test" first.`);
  }
  const report = JSON.parse(fs.readFileSync(args.input, 'utf8'));
  const paths = pathScrubber(report.config);
  const rows = flatten(report.suites).map((row) => ({
    ...row,
    file: paths.relative(row.file),
    error: paths.scrub(row.error),
  }));
  const html = render(report, rows);

  fs.mkdirSync(path.dirname(args.output), { recursive: true });
  if (args.html) fs.writeFileSync(args.html, html);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    await page.pdf({
      path: args.output,
      format: 'A4',
      printBackground: true,
      margin: { top: '16mm', bottom: '16mm', left: '12mm', right: '12mm' },
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate:
        '<div style="font-size:8px;width:100%;text-align:center;color:#6b7280">' +
        'Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
    });
  } finally {
    await browser.close();
  }
  console.log(`PDF report written to ${args.output} (${rows.length} tests)`);
}

/** File suites → one row per (test × project). Describe titles become a breadcrumb. */
function flatten(fileSuites) {
  return fileSuites.flatMap((fileSuite) => walk(fileSuite, []));
}

function walk(suite, describes) {
  const rows = (suite.specs ?? []).flatMap((spec) =>
    spec.tests.map((t) => ({
      file: spec.file,
      title: [...describes, spec.title].join(' › '),
      project: t.projectName,
      outcome: OUTCOME[t.status] ?? t.status,
      duration: t.results.at(-1)?.duration ?? 0,
      retries: Math.max(t.results.length - 1, 0),
      tags: spec.tags,
      error: firstError(t.results),
    })),
  );
  const nested = (suite.suites ?? []).flatMap((child) => walk(child, [...describes, child.title]));
  return [...rows, ...nested];
}

/**
 * The JSON report holds absolute paths (rootDir, stack traces) that expose the
 * machine and user name. Files become repo-relative; any absolute path left in
 * error text is rewritten relative to the repo, and home directories become "~".
 */
function pathScrubber(config) {
  const repoRoot = path.dirname(config.configFile);
  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match the repo root with either slash style (the JSON mixes them on Windows).
  const rootPattern = new RegExp(
    '[\\\\/]?' +
      repoRoot
        .split(/[\\/]+/)
        .filter(Boolean)
        .map(escapeRegExp)
        .join('[\\\\/]+') +
      '[\\\\/]*',
    'gi',
  );
  const homePattern = /(?:[A-Za-z]:[\\/]+Users|\/home|\/Users)[\\/]+[^\\/\s'"]+/g;
  return {
    relative: (file) => path.relative(repoRoot, path.resolve(config.rootDir, file)).replaceAll('\\', '/'),
    scrub: (text) => text?.replace(rootPattern, '').replace(homePattern, '~'),
  };
}

function firstError(results) {
  const message = results.flatMap((r) => r.errors ?? []).find((e) => e.message)?.message;
  return message?.replace(ANSI_COLOURS, '').split('\n').slice(0, 6).join('\n');
}

function tally(rows, keyOf) {
  const groups = new Map();
  for (const row of rows) {
    for (const key of [keyOf(row)].flat()) {
      const g = groups.get(key) ?? { key, passed: 0, failed: 0, flaky: 0, skipped: 0, total: 0 };
      g[row.outcome] += 1;
      g.total += 1;
      groups.set(key, g);
    }
  }
  return [...groups.values()].sort((a, b) => b.total - a.total);
}

function render(report, rows) {
  const counts = tally(rows, () => 'all')[0] ?? { passed: 0, failed: 0, flaky: 0, skipped: 0, total: 0 };
  const executed = counts.total - counts.skipped;
  const passRate = executed ? Math.round(((counts.passed + counts.flaky) / executed) * 100) : 0;
  const failures = rows.filter((r) => r.outcome === 'failed' || r.outcome === 'flaky');
  const started = new Date(report.stats.startTime);

  const card = (label, value, tone) =>
    `<div class="card ${tone}"><div class="v">${value}</div><div class="l">${label}</div></div>`;
  const groupTable = (heading, groups) => `
    <h2>${heading}</h2>
    <table><thead><tr><th>${heading.split(' ').at(-1)}</th><th>Total</th><th>Passed</th><th>Failed</th><th>Flaky</th><th>Skipped</th></tr></thead>
    <tbody>${groups
      .map(
        (g) =>
          `<tr><td>${esc(g.key)}</td><td>${g.total}</td><td>${g.passed}</td><td class="${g.failed ? 'bad' : ''}">${g.failed}</td><td>${g.flaky}</td><td>${g.skipped}</td></tr>`,
      )
      .join('')}</tbody></table>`;

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(args.title)}</title><style>
    * { box-sizing: border-box; }
    body { font: 11px/1.45 -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111827; margin: 0; }
    h1 { font-size: 22px; margin: 0 0 2px; } h2 { font-size: 14px; margin: 22px 0 8px; border-bottom: 2px solid #e5e7eb; padding-bottom: 4px; }
    .meta { color: #6b7280; margin-bottom: 14px; }
    .cards { display: flex; gap: 8px; } .card { flex: 1; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; text-align: center; }
    .card .v { font-size: 20px; font-weight: 700; } .card .l { color: #6b7280; text-transform: uppercase; font-size: 9px; letter-spacing: .05em; }
    .good .v { color: #15803d; } .bad, .bad .v { color: #b91c1c; } .warn .v { color: #b45309; }
    table { width: 100%; border-collapse: collapse; } th, td { text-align: left; padding: 4px 6px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
    th { background: #f9fafb; font-size: 10px; text-transform: uppercase; color: #374151; } tr { page-break-inside: avoid; }
    .pill { display: inline-block; padding: 0 6px; border-radius: 9px; font-size: 9px; font-weight: 600; }
    .pill.passed { background: #dcfce7; color: #166534; } .pill.failed { background: #fee2e2; color: #991b1b; }
    .pill.flaky { background: #fef3c7; color: #92400e; } .pill.skipped { background: #f3f4f6; color: #4b5563; }
    pre { white-space: pre-wrap; font-size: 9px; background: #fef2f2; padding: 6px; border-radius: 4px; margin: 4px 0 0; }
    .tags { color: #6b7280; font-size: 9px; }
  </style></head><body>
    <h1>${esc(args.title)}</h1>
    <div class="meta">${started.toUTCString()} · ${(report.stats.duration / 1000).toFixed(1)}s ·
      Playwright ${esc(report.config.version)} · ${report.config.workers} workers${report.config.shard ? ` · shard ${report.config.shard.current}/${report.config.shard.total}` : ''}</div>
    <div class="cards">
      ${card('Pass rate', `${passRate}%`, passRate === 100 ? 'good' : 'bad')}
      ${card('Passed', counts.passed, 'good')}${card('Failed', counts.failed, counts.failed ? 'bad' : '')}
      ${card('Flaky', counts.flaky, counts.flaky ? 'warn' : '')}${card('Skipped', counts.skipped, '')}
    </div>
    ${groupTable(
      'Results by project',
      tally(rows, (r) => r.project),
    )}
    ${groupTable(
      'Results by tag',
      tally(rows, (r) => r.tags.map((t) => `@${t}`)),
    )}
    ${
      failures.length
        ? `<h2 class="bad">Failed &amp; flaky (${failures.length})</h2><table><tbody>${failures
            .map(
              (r) =>
                `<tr><td><span class="pill ${r.outcome}">${r.outcome}</span> <b>${esc(r.title)}</b> <span class="tags">[${esc(r.project)}] ${esc(r.file)}</span>${r.error ? `<pre>${esc(r.error)}</pre>` : ''}</td></tr>`,
            )
            .join('')}</tbody></table>`
        : ''
    }
    <h2>All tests (${rows.length})</h2>
    <table><thead><tr><th>Status</th><th>Test</th><th>Project</th><th>Duration</th></tr></thead><tbody>${rows
      .map(
        (r) =>
          `<tr><td><span class="pill ${r.outcome}">${r.outcome}</span></td><td>${esc(r.title)}<div class="tags">${esc(r.file)} ${r.tags.map((t) => '@' + esc(t)).join(' ')}${r.retries ? ` · ${r.retries} retr${r.retries > 1 ? 'ies' : 'y'}` : ''}</div></td><td>${esc(r.project)}</td><td>${(r.duration / 1000).toFixed(1)}s</td></tr>`,
      )
      .join('')}</tbody></table>
  </body></html>`;
}

function esc(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}
