import { test as setup, expect } from '../../src/fixtures/index.js';
import { env } from '../../config/env.js';

// Logs in through the UI once and saves cookies + localStorage. The "ui" project
// loads this file as its storageState, so its tests start already signed in.
setup('authenticate UI user', async ({ page, pages }) => {
  await pages.login.open();
  await pages.login.login(env.uiCredentials);
  await expect(page).toHaveURL(/inventory\.html/);
  await expect(pages.inventory.title).toHaveText('Products');

  await page.context().storageState({ path: env.uiStorageState });
});
