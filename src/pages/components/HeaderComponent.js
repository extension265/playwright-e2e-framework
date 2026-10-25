/** App header shown on every authenticated page: cart link, badge and side menu. */
export class HeaderComponent {
  /** @param {import('@playwright/test').Page} page */
  constructor(page) {
    this.page = page;
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = page.getByTestId('logout-sidebar-link');
  }

  async openCart() {
    await this.cartLink.click();
  }

  async logout() {
    await this.menuButton.click();
    await this.logoutLink.click();
  }
}
