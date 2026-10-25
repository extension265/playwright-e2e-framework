import { BasePage } from './BasePage.js';

/** Covers the three checkout steps: your information → overview → complete. */
export class CheckoutPage extends BasePage {
  constructor(page) {
    super(page, '/checkout-step-one.html');
    // Step 1 — customer information
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.continueButton = page.getByTestId('continue');
    this.error = page.getByTestId('error');
    // Step 2 — overview
    this.itemTotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByTestId('finish');
    // Step 3 — complete
    this.completeHeader = page.getByTestId('complete-header');
  }

  async submitCustomerInfo({ firstName, lastName, postalCode }) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueButton.click();
  }

  async summary() {
    const [itemTotal, tax, total] = await Promise.all(
      [this.itemTotal, this.tax, this.total].map(async (l) => BasePage.parsePrice(await l.innerText())),
    );
    return { itemTotal, tax, total };
  }

  async finish() {
    await this.finishButton.click();
  }
}
