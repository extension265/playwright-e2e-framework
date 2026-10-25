import { test, expect } from '../../src/fixtures/index.js';
import { PRODUCTS } from '../../src/data/inventory.data.js';
import { TAX_RATE, buildCustomer, checkoutValidationCases } from '../../src/data/checkout.data.js';

const toCents = (n) => Math.round(n * 100);

test.describe('Checkout', { tag: '@ui' }, () => {
  test.beforeEach(async ({ pages }) => {
    await pages.inventory.open();
    await pages.inventory.addToCart(PRODUCTS.backpack);
    await pages.inventory.addToCart(PRODUCTS.boltShirt);
    await pages.inventory.header.openCart();
    await pages.cart.checkout();
  });

  test('completes a purchase with correct totals', { tag: '@smoke' }, async ({ pages }) => {
    const { checkout } = pages;
    await checkout.submitCustomerInfo(buildCustomer());

    const { itemTotal, tax, total } = await checkout.summary();
    expect(toCents(tax)).toBe(toCents(itemTotal * TAX_RATE));
    expect(toCents(total)).toBe(toCents(itemTotal) + toCents(tax));

    await checkout.finish();
    await expect(checkout.completeHeader).toHaveText('Thank you for your order!');
    await expect(pages.inventory.header.cartBadge).toBeHidden();
  });

  for (const { missing, overrides, error } of checkoutValidationCases) {
    test(`requires ${missing}`, { tag: '@regression' }, async ({ page, pages }) => {
      await pages.checkout.submitCustomerInfo(buildCustomer(overrides));

      await expect(pages.checkout.error).toHaveText(error);
      await expect(page).toHaveURL(/checkout-step-one/);
    });
  }
});
