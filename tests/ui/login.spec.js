import { test, expect } from '../../src/fixtures/index.js';
import { env } from '../../config/env.js';
import { loginFailureCases } from '../../src/data/login.data.js';

// Login must be exercised from a signed-out browser, so opt out of the
// project's saved storageState for this file.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', { tag: '@ui' }, () => {
  test.beforeEach(async ({ pages }) => {
    await pages.login.open();
  });

  test('valid user lands on the product catalogue', { tag: '@smoke' }, async ({ page, pages }) => {
    await pages.login.login(env.uiCredentials);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(pages.inventory.title).toHaveText('Products');
    await expect(pages.inventory.items).toHaveCount(6);
  });

  // Data-driven: one test per case in src/data/login.data.js
  for (const { name, credentials, error } of loginFailureCases(env.uiCredentials)) {
    test(`rejects ${name}`, { tag: '@regression' }, async ({ page, pages }) => {
      await pages.login.login(credentials);

      await expect(pages.login.error).toHaveText(error);
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  }
});
