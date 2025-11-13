import { Page } from "@playwright/test";

/**
 * Base page class providing common functionality for all page objects
 * Implements the Page Object Model pattern for maintainable e2e tests
 */
export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   */
  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url);
  }

  /**
   * Wait for the page to load completely
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Get the current page URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Wait for a specific element to be visible
   */
  async waitForElement(testId: string): Promise<void> {
    await this.page.waitForSelector(`[data-testid="${testId}"]`);
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(testId: string): Promise<boolean> {
    return await this.page.locator(`[data-testid="${testId}"]`).isVisible();
  }
}
