import { BasePage } from './BasePage.js';
import { HeaderComponent } from './components/HeaderComponent.js';

export class CartPage extends BasePage {
  constructor(page) {
    super(page, '/cart.html');
    this.header = new HeaderComponent(page);
    this.items = page.getByTestId('inventory-item');
    this.checkoutButton = page.getByTestId('checkout');
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}
