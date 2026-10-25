import { test, expect } from '../../src/fixtures/index.js';

test.describe('Session reuse', { tag: '@ui' }, () => {
  test('starts signed in from the saved storageState', { tag: '@smoke' }, async ({ page, pages }) => {
    // No login step: the session comes from the setup-ui project.
    await pages.inventory.open();

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(pages.inventory.title).toHaveText('Products');
    await expect(pages.login.loginButton).toBeHidden();
  });

  test('logout ends the session for this test only', { tag: '@regression' }, async ({ page, pages }) => {
    await pages.inventory.open();
    await pages.inventory.header.logout();
    await expect(pages.login.loginButton).toBeVisible();

    // Protected pages now bounce back to login. Other tests are unaffected:
    // each gets a fresh context seeded from the saved state file.
    await page.goto('/inventory.html');
    await expect(pages.login.error).toContainText('when you are logged in');
  });
});
