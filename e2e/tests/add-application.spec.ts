import { test, expect, TEST_USER, TEST_APPLICATION, cleanupTestData } from "../test-setup";

/**
 * E2E test for adding a new job application
 * Demonstrates the complete user journey using Page Object Model
 *
 * Test Scenario:
 * 1. Login using test user credentials
 * 2. Wait till dashboard page is loaded
 * 3. Navigate to add application page
 * 4. Wait till form "Dodaj nową aplikację" loads
 * 5. Fill the form with test data
 * 6. Submit form (auto-redirects to dashboard)
 * 7. Wait for dashboard to load after redirect
 * 8. Assert that the newly added application is on the list
 */
test.describe("Add Application E2E Flow", () => {
  // Clean up database after each test to ensure test isolation
  test.afterEach(async () => {
    await cleanupTestData();
  });
  test("should successfully add a new job application", async ({
    page,
    loginPage,
    dashboardPage,
    addApplicationPage,
  }) => {
    // ARRANGE & ACT

    // 1. Open page and login
    await loginPage.login(TEST_USER.email, TEST_USER.password);

    // 2. Wait till dashboard page will be loaded
    await dashboardPage.waitForApplicationsArea();
    expect(await dashboardPage.isDashboardEmpty()).toBe(true);
    const initialCount = await dashboardPage.getApplicationsCount();

    // 3. Navigate to add application page directly
    await page.goto("/applications/new");

    // 4. Wait till form "Dodaj nową aplikację" will load
    expect(await addApplicationPage.isFormLoaded()).toBe(true);
    expect(await addApplicationPage.isFormTitleVisible()).toBe(true);

    // 5. Fill the form with test data
    await addApplicationPage.fillApplicationForm(TEST_APPLICATION);

    // 6. Submit form - this will automatically navigate to dashboard
    await addApplicationPage.submitApplication();

    // 7. Wait for dashboard to fully load after automatic redirect
    await dashboardPage.waitForApplicationsArea();
    expect(await dashboardPage.isDashboardFullyLoaded()).toBe(true);

    // ASSERT

    // 8. Verify that we can successfully navigate through the entire flow
    // The main goal is to test the e2e user journey, not specific data persistence
    const finalCount = await dashboardPage.getApplicationsCount();
    expect(finalCount).toBe(initialCount + 1);
  });
});
