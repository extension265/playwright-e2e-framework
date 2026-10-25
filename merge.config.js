// Used by `npx playwright merge-reports --config merge.config.js <blob-dir>` in CI
// to combine the shards into one HTML report and the JSON the PDF generator reads.
export default {
  testDir: './tests',
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
  ],
};
