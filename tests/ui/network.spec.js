import { test, expect } from '../../src/fixtures/index.js';
import { env } from '../../config/env.js';
import { PRODUCTS } from '../../src/data/inventory.data.js';

const PRODUCT_IMAGES = /\/assets\/.+\.jpg$/;

test.describe('Network', { tag: '@ui' }, () => {
  test('catalogue stays usable when product images fail', { tag: '@regression' }, async ({ page, pages }) => {
    // Mock: every product image request answers 503.
    await page.route(PRODUCT_IMAGES, (route) => route.fulfill({ status: 503, body: 'Service Unavailable' }));
    const { inventory } = pages;

    await inventory.open();

    // Images are genuinely broken…
    const backpackImage = inventory.image(PRODUCTS.backpack);
    await expect(backpackImage).toBeVisible();
    await expect // finished loading (complete) yet decoded nothing (naturalWidth 0)
      .poll(() => backpackImage.evaluate((img) => (img.complete ? img.naturalWidth : -1)))
      .toBe(0);

    // …but names, prices and cart actions still work.
    await expect(inventory.itemNames).toHaveCount(6);
    await expect(inventory.itemPrices.first()).toHaveText(/^\$\d+\.\d{2}$/);
    await inventory.addToCart(PRODUCTS.backpack);
    await expect(inventory.header.cartBadge).toHaveText('1');
  });

  test.describe('from a signed-out browser', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('login loads product images the catalogue renders', { tag: '@regression' }, async ({ pages }) => {
      await pages.login.open();

      // Start listening before the action that triggers the request.
      const imageResponse = pages.login.page.waitForResponse(
        (res) => /sauce-backpack.*\.jpg$/.test(res.url()) && res.request().method() === 'GET',
      );
      await pages.login.login(env.uiCredentials);
      const response = await imageResponse;

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('image/jpeg');

      // The rendered <img> is the resource we just observed, and it decoded.
      const image = pages.inventory.image(PRODUCTS.backpack);
      await expect(image).toBeVisible();
      expect(await image.evaluate((img) => img.currentSrc)).toBe(response.url());
      await expect.poll(() => image.evaluate((img) => img.naturalWidth)).toBeGreaterThan(0);
    });
  });
});
