import { BasePage } from './BasePage.js';

export class LoginPage extends BasePage {
  constructor(page) {
    super(page, '/');
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.error = page.getByTestId('error');
  }

  /** Fills the form and submits. Does not assert the outcome — tests decide what success means. */
  async login({ username, password }) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
