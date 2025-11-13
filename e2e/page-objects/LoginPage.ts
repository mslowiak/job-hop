import { BasePage } from "./BasePage";

/**
 * Login page object model class
 * Handles authentication functionality for e2e tests
 */
export class LoginPage extends BasePage {
  // Page elements selectors
  private readonly emailInput = '[data-testid="login-email-input"]';
  private readonly passwordInput = '[data-testid="login-password-input"]';
  private readonly submitButton = '[data-testid="login-submit-btn"]';

  /**
   * Navigate to the login page
   */
  async navigateToLogin(): Promise<void> {
    await this.navigateTo("/auth/login");
    await this.waitForLoad();
  }

  /**
   * Fill the login form with credentials
   */
  async fillLoginForm(email: string, password: string): Promise<void> {
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
  }

  /**
   * Submit the login form
   */
  async submitLogin(): Promise<void> {
    await this.page.click(this.submitButton);
  }

  /**
   * Perform complete login flow
   */
  async login(email: string, password: string): Promise<void> {
    await this.navigateToLogin();
    await this.fillLoginForm(email, password);
    await this.submitLogin();
    // Wait for navigation to dashboard
    await this.page.waitForURL("**/dashboard");
  }

  /**
   * Check if login form is displayed
   */
  async isLoginFormVisible(): Promise<boolean> {
    return await this.isElementVisible("login-email-input");
  }

  /**
   * Get login form validation errors if any
   */
  async getFormErrors(): Promise<string[]> {
    const errorElements = await this.page
      .locator(".text-red-600")
      .allTextContents();
    return errorElements;
  }
}
