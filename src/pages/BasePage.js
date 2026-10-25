/**
 * Shared behaviour for every page object. Screen-specific locators live in the
 * concrete page's constructor; only cross-cutting helpers belong here.
 */
export class BasePage {
  /** @param {import('@playwright/test').Page} page */
  constructor(page, path = '/') {
    this.page = page;
    this.path = path;
    this.title = page.getByTestId('title');
  }

  async open() {
    await this.page.goto(this.path);
  }

  /** "$29.99" → 29.99 */
  static parsePrice(text) {
    return Number(text.replace(/[^0-9.]/g, ''));
  }
}
