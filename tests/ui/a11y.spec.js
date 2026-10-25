import { test, expect } from '../../src/fixtures/index.js';

// Gate on the impacts that block users; minor/moderate findings are still in the
// attached report for triage, but don't fail the build.
const BLOCKING_IMPACTS = ['critical', 'serious'];

async function scanForBlockingViolations(makeAxeBuilder, testInfo) {
  const results = await makeAxeBuilder().analyze();
  await testInfo.attach('axe-results', { body: JSON.stringify(results, null, 2), contentType: 'application/json' });
  return results.violations
    .filter((v) => BLOCKING_IMPACTS.includes(v.impact))
    .map(({ id, impact, help, nodes }) => ({ id, impact, help, nodes: nodes.length }));
}

test.describe('Accessibility (WCAG 2.1 A/AA)', { tag: ['@ui', '@a11y', '@regression'] }, () => {
  test.describe('signed out', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('login page has no critical or serious violations', async ({ pages, makeAxeBuilder }, testInfo) => {
      await pages.login.open();
      await expect(pages.login.loginButton).toBeVisible();

      expect(await scanForBlockingViolations(makeAxeBuilder, testInfo)).toEqual([]);
    });
  });

  test('product catalogue has no critical or serious violations', async ({ pages, makeAxeBuilder }, testInfo) => {
    await pages.inventory.open();
    await expect(pages.inventory.items).toHaveCount(6);

    expect(await scanForBlockingViolations(makeAxeBuilder, testInfo)).toEqual([]);
  });
});
