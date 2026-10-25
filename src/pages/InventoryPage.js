import { BasePage } from './BasePage.js';
import { HeaderComponent } from './components/HeaderComponent.js';

export class InventoryPage extends BasePage {
  constructor(page) {
    super(page, '/inventory.html');
    this.header = new HeaderComponent(page);
    this.items = page.getByTestId('inventory-item');
    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.sortSelect = page.getByTestId('product-sort-container');
  }

  item(productName) {
    return this.items.filter({ has: this.page.getByText(productName, { exact: true }) });
  }

  image(productName) {
    return this.item(productName).getByRole('img', { name: productName });
  }

  async addToCart(productName) {
    await this.item(productName).getByRole('button', { name: 'Add to cart' }).click();
  }

  async removeFromCart(productName) {
    await this.item(productName).getByRole('button', { name: 'Remove' }).click();
  }

  /** @param {'az'|'za'|'lohi'|'hilo'} option */
  async sortBy(option) {
    await this.sortSelect.selectOption(option);
  }

  async names() {
    return this.itemNames.allInnerTexts();
  }

  async prices() {
    return (await this.itemPrices.allInnerTexts()).map(BasePage.parsePrice);
  }
}
