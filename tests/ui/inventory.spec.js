import { test, expect } from '../../src/fixtures/index.js';
import { PRODUCTS, sortCases } from '../../src/data/inventory.data.js';

test.describe('Inventory', { tag: '@ui' }, () => {
  test.beforeEach(async ({ pages }) => {
    await pages.inventory.open();
  });

  for (const { label, option, read, compare } of sortCases) {
    test(`sorts by ${label}`, { tag: '@regression' }, async ({ pages }) => {
      await pages.inventory.sortBy(option);

      const values = await pages.inventory[read]();
      expect(values).toEqual([...values].sort(compare));
    });
  }

  test('adding and removing items updates the cart badge', { tag: '@smoke' }, async ({ pages }) => {
    const { inventory } = pages;

    await inventory.addToCart(PRODUCTS.backpack);
    await inventory.addToCart(PRODUCTS.bikeLight);
    await expect(inventory.header.cartBadge).toHaveText('2');

    await inventory.removeFromCart(PRODUCTS.backpack);
    await expect(inventory.header.cartBadge).toHaveText('1');

    await inventory.removeFromCart(PRODUCTS.bikeLight);
    await expect(inventory.header.cartBadge).toBeHidden();
  });
});
