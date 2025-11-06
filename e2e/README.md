# E2E Testing with Playwright

This directory contains end-to-end tests for JobHop using Playwright with the Page Object Model pattern.

## 🏗️ Architecture

### Page Object Model (POM)

All page objects are located in `e2e/page-objects/` and follow the POM pattern for maintainable and reusable test code.

#### BasePage (`BasePage.ts`)
- Common functionality shared across all page objects
- Navigation, waiting, and basic element interactions

#### LoginPage (`LoginPage.ts`)
- Handles authentication functionality
- Login form interactions and validation

#### DashboardPage (`DashboardPage.ts`)
- Dashboard interactions and application management
- Applications table operations and verification

#### AddApplicationPage (`AddApplicationPage.ts`)
- Add new application form interactions
- Form filling, validation, and submission

## 🚀 Getting Started

### Prerequisites

1. Install Playwright dependencies:
```bash
npm install --save-dev @playwright/test dotenv
npx playwright install
```

2. Configure test environment variables:
   - Copy `.env.test` and update with your test credentials
   - The file contains test user email and password for authentication

3. Start the development server in test mode:
```bash
npm run dev:e2e
```

### Running Tests

```bash
# Run all e2e tests
npx playwright test

# Run specific test file
npx playwright test add-application.spec.ts

# Run tests in headed mode (visible browser)
npx playwright test --headed

# Run tests with debugging
npx playwright test --debug

# Generate test report
npx playwright show-report
```

## 📝 Writing Tests

### Using Page Objects

```typescript
import { test } from '../test-setup';

test('example test', async ({ loginPage, dashboardPage }) => {
  // Login
  await loginPage.login('user@example.com', 'password');

  // Navigate to dashboard
  await dashboardPage.waitForApplicationsTable();

  // Assertions
  expect(await dashboardPage.isDashboardLoaded()).toBe(true);
});
```

### Test Structure

Tests follow the **Arrange, Act, Assert** pattern:

```typescript
test('should perform action', async ({ pageObjects }) => {
  // ARRANGE - Setup test preconditions
  await loginPage.login(TEST_USER.email, TEST_USER.password);

  // ACT - Perform the action being tested
  await dashboardPage.clickAddApplication();

  // ASSERT - Verify the expected outcome
  expect(await addApplicationPage.isFormLoaded()).toBe(true);
});
```

## 🔧 Configuration

### Environment Variables (`.env.test`)
Playwright automatically loads test environment variables from `.env.test`:

```bash
# Test user credentials
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword123

# Optional: Override base URL for testing
TEST_BASE_URL=http://localhost:3000
```

### Playwright Config (`playwright.config.ts`)
- Configured for Chromium browser only
- Uses `http://localhost:3000` as base URL (configurable via `TEST_BASE_URL`)
- Includes web server configuration for automatic startup
- Loads environment variables from `.env.test` using dotenv

### Test Setup (`test-setup.ts`)
- Provides authenticated page fixtures
- Contains test data constants loaded from environment variables
- Extends Playwright's test function with page objects

## 📊 Test Data

Common test data is defined in `test-setup.ts`:

- `TEST_USER`: Default test user credentials
- `TEST_APPLICATION`: Sample application data

## 🏃 Available Scripts

```json
{
  "dev:e2e": "astro dev --mode test",
  "test:e2e": "playwright test",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:debug": "playwright test --debug",
  "test:e2e:report": "playwright show-report"
}
```

## 🎯 Best Practices

1. **Use Page Objects**: Always use POM classes instead of direct selectors
2. **Follow AAA Pattern**: Arrange, Act, Assert structure for all tests
3. **Use data-testid**: All selectors use `data-testid` attributes for resilience
4. **Keep Tests Independent**: Each test should be able to run in isolation
5. **Descriptive Test Names**: Use clear, descriptive test names
6. **Wait for Elements**: Always wait for elements before interacting

## 🔍 Debugging

- Use `--debug` flag for step-by-step debugging
- Use `--headed` flag to see browser interactions
- Check `playwright-report` for detailed test results
- Use trace viewer: `npx playwright show-trace`

## 📁 Directory Structure

```
e2e/
├── page-objects/          # Page Object Model classes
│   ├── BasePage.ts       # Base page functionality
│   ├── LoginPage.ts      # Login page interactions
│   ├── DashboardPage.ts  # Dashboard interactions
│   ├── AddApplicationPage.ts # Add application form
│   └── index.ts          # Exports
├── tests/                # Test files
│   └── add-application.spec.ts # Application tests
├── test-setup.ts         # Test fixtures and utilities
└── README.md            # This file
```
