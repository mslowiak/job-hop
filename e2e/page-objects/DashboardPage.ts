import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Dashboard page object model class
 * Handles dashboard interactions and application management
 */
export class DashboardPage extends BasePage {
  // Page elements selectors
  private readonly dashboardMain = '[data-testid="dashboard-main"]';
  private readonly addApplicationButton = '[data-testid="dashboard-main"] [data-testid="add-application-btn"]';
  private readonly applicationsTable = '[data-testid="applications-table"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to the dashboard page
   */
  async navigateToDashboard(): Promise<void> {
    await this.navigateTo('/dashboard');
    await this.waitForLoad();
  }

  /**
   * Check if dashboard is loaded (main element exists)
   */
  async isDashboardLoaded(): Promise<boolean> {
    return await this.isElementVisible('dashboard-main');
  }

  /**
   * Check if dashboard is fully loaded (applications area is visible)
   */
  async isDashboardFullyLoaded(): Promise<boolean> {
    return await this.isElementVisible('applications-table')
  }

  async isDashboardEmpty(): Promise<boolean> {
    return await this.isElementVisible('applications-empty-state');
  }

  /**
   * Click the "Dodaj aplikację" button to navigate to add application form
   */
  async clickAddApplication(): Promise<void> {
    // Use first() to avoid strict mode violation with duplicate test IDs
    await this.page.locator(this.addApplicationButton).first().click();

    // Wait a bit for navigation to start
    await this.page.waitForTimeout(1000);

    // Check current URL to see if navigation happened
    const currentUrl = this.page.url();
    console.log('Current URL after button click:', currentUrl);

    // Wait for the add application form to appear
    await this.page.waitForSelector('[data-testid="add-application-form-title"]', { timeout: 5000 });
  }

  /**
   * Check if applications table is visible
   */
  async isApplicationsTableVisible(): Promise<boolean> {
    return await this.isElementVisible('applications-table');
  }

  /**
   * Get the count of applications in the table
   */
  async getApplicationsCount(): Promise<number> {
    const rows = await this.page.locator('[data-testid^="application-row-"]').count();
    return rows;
  }

  /**
   * Check if a specific application exists by company and position
   */
  async hasApplication(companyName: string, positionName: string): Promise<boolean> {
    const rows = await this.page.locator('[data-testid^="application-row-"]').all();

    for (const row of rows) {
      const companyCell = row.locator('td').nth(0);
      const positionCell = row.locator('td').nth(1);

      const companyText = await companyCell.textContent();
      const positionText = await positionCell.textContent();

      if (companyText?.includes(companyName) && positionText?.includes(positionName)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get application row by company and position
   */
  async getApplicationRow(companyName: string, positionName: string): Promise<any> {
    const rows = await this.page.locator('[data-testid^="application-row-"]').all();

    for (const row of rows) {
      const companyCell = row.locator('td').nth(0);
      const positionCell = row.locator('td').nth(1);

      const companyText = await companyCell.textContent();
      const positionText = await positionCell.textContent();

      if (companyText?.includes(companyName) && positionText?.includes(positionName)) {
        return row;
      }
    }

    return null;
  }

  /**
   * Wait for applications area to load (either table or empty state)
   */
  async waitForApplicationsArea(): Promise<void> {
    // First wait for dashboard main to be visible
    await this.page.waitForSelector(this.dashboardMain, { state: "visible" });

    // Wait for loading spinner to disappear (if it appears)
    // Use a short timeout since loading might be very fast
    try {
      await this.page.waitForSelector(".animate-spin", {
        state: "attached",
        timeout: 1000,
      });
      // If spinner appeared, wait for it to disappear
      await this.page.waitForSelector(".animate-spin", {
        state: "detached",
        timeout: 10000,
      });
    } catch {
      // Spinner might not appear at all if data loads very quickly
      // This is fine, continue
    }

    // Finally, wait for either the applications table or empty state to appear
    await Promise.race([
      this.page.waitForSelector('[data-testid="applications-table"]', {
        state: "visible",
      }),
      this.page.waitForSelector('[data-testid="applications-empty-state"]', {
        state: "visible",
      }),
    ]);
  }
}
