import { LoginPage } from './LoginPage.js';
import { InventoryPage } from './InventoryPage.js';
import { CartPage } from './CartPage.js';
import { CheckoutPage } from './CheckoutPage.js';

/**
 * Single entry point to every page object for one Playwright page.
 * Pages are created on first access and cached, so tests only pay for what they use.
 */
export class PageManager {
  #cache = new Map();

  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
  }

  #get(PageClass) {
    if (!this.#cache.has(PageClass)) this.#cache.set(PageClass, new PageClass(this.page));
    return this.#cache.get(PageClass);
  }

  get login() {
    return this.#get(LoginPage);
  }

  get inventory() {
    return this.#get(InventoryPage);
  }

  get cart() {
    return this.#get(CartPage);
  }

  get checkout() {
    return this.#get(CheckoutPage);
  }
}
