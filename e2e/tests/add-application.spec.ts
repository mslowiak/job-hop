import { test, expect, TEST_USER, generateRandomApplication } from '../test-setup';

/**
 * E2E test for adding a new job application
 * Demonstrates the complete user journey using Page Object Model
 *
 * Test Scenario:
 * 1. Open page
 * 2. Click "Zaloguj się". Log in using a test user credentials
 * 3. Wait till dashboard page will be loaded
 * 4. Click on "Dodaj aplikację" button
 * 5. Wait till form "Dodaj nową aplikację" will load
 * 6. Fill the form with test data
 * 7. Click "Dodaj aplikację" button
 * 8. Wait for dashboard page to load
 * 9. Assert that the newly added application is on the list
 */
test.describe('Add Application E2E Flow', () => {
  test('should successfully add a new job application', async ({
    loginPage,
    dashboardPage,
    addApplicationPage,
  }) => {
    // ARRANGE & ACT

    // 1. Open page and login
    await loginPage.login(TEST_USER.email, TEST_USER.password);

    // 2. Wait till dashboard page will be loaded
    await dashboardPage.waitForApplicationsTable();
    expect(await dashboardPage.isDashboardLoaded()).toBe(true);

    // 3. Get initial applications count
    const initialCount = await dashboardPage.getApplicationsCount();

    // 4. Click on "Dodaj aplikację" button
    await dashboardPage.clickAddApplication();

    // 5. Wait till form "Dodaj nową aplikację" will load
    expect(await addApplicationPage.isFormLoaded()).toBe(true);
    expect(await addApplicationPage.isFormTitleVisible()).toBe(true);

    // 6. Fill the form with test data
    await addApplicationPage.fillApplicationForm(TEST_APPLICATION);

    // 7. Click "Dodaj aplikację" button
    await addApplicationPage.submitApplication();

    // 8. Wait for dashboard page to load
    await dashboardPage.waitForApplicationsTable();
    expect(await dashboardPage.isDashboardLoaded()).toBe(true);

    // ASSERT

    // 9. Assert that the newly added application is on the list
    const finalCount = await dashboardPage.getApplicationsCount();
    expect(finalCount).toBe(initialCount + 1);

    // Verify the application details are displayed correctly
    expect(await dashboardPage.hasApplication(TEST_APPLICATION.company, TEST_APPLICATION.position)).toBe(true);
  });

  test('should validate required fields in add application form', async ({
    loginPage,
    dashboardPage,
    addApplicationPage,
  }) => {
    // ARRANGE
    await loginPage.login(TEST_USER.email, TEST_USER.password);
    await dashboardPage.clickAddApplication();

    // ACT - Try to submit empty form
    await addApplicationPage.submitApplication();

    // ASSERT - Should stay on form page and show errors
    expect(await addApplicationPage.isFormLoaded()).toBe(true);
    const errors = await addApplicationPage.getFormErrors();
    expect(errors.length).toBeGreaterThan(0);
  });

  test('should handle form submission with invalid data', async ({
    loginPage,
    dashboardPage,
    addApplicationPage,
  }) => {
    // ARRANGE
    await loginPage.login(TEST_USER.email, TEST_USER.password);
    await dashboardPage.clickAddApplication();

    // ACT - Fill form with invalid URL
    await addApplicationPage.fillApplicationForm({
      ...TEST_APPLICATION,
      link: 'invalid-url',
    });
    await addApplicationPage.submitApplication();

    // ASSERT - Should stay on form and show validation errors
    expect(await addApplicationPage.isFormLoaded()).toBe(true);
    const errors = await addApplicationPage.getFormErrors();
    expect(errors.some(error => error.includes('link'))).toBe(true);
  });
});
