import { BasePage } from "./BasePage";

/**
 * Add Application page object model class
 * Handles the add new application form interactions
 */
export class AddApplicationPage extends BasePage {
  // Page elements selectors
  private readonly addApplicationView = '[data-testid="add-application-view"]';
  private readonly formTitle = '[data-testid="add-application-form-title"]';
  private readonly companyInput = '[data-testid="application-company-input"]';
  private readonly positionInput = '[data-testid="application-position-input"]';
  private readonly dateInput = '[data-testid="application-date-input"]';
  private readonly statusSelect = '[data-testid="application-status-select"]';
  private readonly linkInput = '[data-testid="application-link-input"]';
  private readonly notesTextarea = '[data-testid="application-notes-textarea"]';
  private readonly submitButton = '[data-testid="application-submit-btn"]';

  /**
   * Navigate to the add application page
   */
  async navigateToAddApplication(): Promise<void> {
    await this.navigateTo("/applications/new");
    await this.waitForLoad();
  }

  /**
   * Check if add application form is loaded
   */
  async isFormLoaded(): Promise<boolean> {
    return await this.isElementVisible("add-application-view");
  }

  /**
   * Check if form title is visible
   */
  async isFormTitleVisible(): Promise<boolean> {
    return await this.isElementVisible("add-application-form-title");
  }

  /**
   * Fill the complete application form
   */
  async fillApplicationForm(data: {
    company: string;
    position: string;
    date?: string;
    status?: string;
    link?: string;
    notes?: string;
  }): Promise<void> {
    // Wait for required fields to be visible and fill them
    await this.page.waitForSelector(this.companyInput, { state: "visible" });
    await this.page.fill(this.companyInput, "");
    await this.page.fill(this.companyInput, data.company);

    await this.page.waitForSelector(this.positionInput, { state: "visible" });
    await this.page.fill(this.positionInput, "");
    await this.page.fill(this.positionInput, data.position);

    if (data.date) {
      await this.page.waitForSelector(this.dateInput, { state: "visible" });
      await this.page.fill(this.dateInput, data.date);
    }

    if (data.status) {
      await this.page.waitForSelector(this.statusSelect, { state: "visible" });
      await this.page.selectOption(this.statusSelect, data.status);
    }

    if (data.link) {
      await this.page.waitForSelector(this.linkInput, { state: "visible" });
      await this.page.fill(this.linkInput, data.link);
    }

    if (data.notes) {
      await this.page.waitForSelector(this.notesTextarea, { state: "visible" });
      await this.page.fill(this.notesTextarea, data.notes);
    }
  }

  /**
   * Submit the application form
   */
  async submitApplication(): Promise<void> {
    // Wait for navigation after form submission
    await Promise.all([
      this.page.waitForURL("**/dashboard", { timeout: 10000 }),
      this.page.click(this.submitButton),
    ]);
  }

  /**
   * Fill form and submit in one action
   */
  async createApplication(data: {
    company: string;
    position: string;
    date?: string;
    status?: string;
    link?: string;
    notes?: string;
  }): Promise<void> {
    await this.fillApplicationForm(data);
    await this.submitApplication();
  }

  /**
   * Get form validation errors
   */
  async getFormErrors(): Promise<string[]> {
    const errorElements = await this.page
      .locator(".text-red-600")
      .allTextContents();
    return errorElements;
  }

  /**
   * Check if submit button is enabled
   */
  async isSubmitButtonEnabled(): Promise<boolean> {
    const isDisabled = await this.page
      .locator(this.submitButton)
      .getAttribute("disabled");
    return isDisabled === null;
  }

  /**
   * Clear all form fields
   */
  async clearForm(): Promise<void> {
    await this.page.fill(this.companyInput, "");
    await this.page.fill(this.positionInput, "");
    await this.page.fill(this.linkInput, "");
    await this.page.fill(this.notesTextarea, "");
  }

  /**
   * Get current form values
   */
  async getFormValues(): Promise<{
    company: string;
    position: string;
    date: string;
    status: string;
    link: string;
    notes: string;
  }> {
    return {
      company: await this.page.inputValue(this.companyInput),
      position: await this.page.inputValue(this.positionInput),
      date: await this.page.inputValue(this.dateInput),
      status: await this.page.inputValue(this.statusSelect),
      link: await this.page.inputValue(this.linkInput),
      notes: await this.page.inputValue(this.notesTextarea),
    };
  }
}
