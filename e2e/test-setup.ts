import { test as base, Page } from "@playwright/test";
import { LoginPage, DashboardPage, AddApplicationPage } from "./page-objects";

/**
 * Test fixtures and utilities for e2e testing
 * Provides authenticated page objects and common test data
 */

// Test user credentials for e2e testing (loaded from .env.test)
export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || "test@example.com",
  password: process.env.TEST_USER_PASSWORD || "testpassword123",
};

// Test application data generators
const COMPANIES = [
  "Google",
  "Microsoft",
  "Apple",
  "Amazon",
  "Meta",
  "Netflix",
  "Tesla",
  "Spotify",
  "Airbnb",
  "Uber",
  "Stripe",
  "Shopify",
  "GitHub",
  "Slack",
  "Zoom",
  "Discord",
  "Notion",
  "Figma",
  "Linear",
  "Vercel",
  "PlanetScale",
  "Supabase",
  "Railway",
  "Fly.io",
];

const POSITIONS = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Software Engineer",
  "Senior Software Engineer",
  "Principal Engineer",
  "Engineering Manager",
  "Product Manager",
  "Product Designer",
  "UI/UX Designer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Site Reliability Engineer",
  "Security Engineer",
  "Technical Lead",
  "Architect",
  "QA Engineer",
  "Test Automation Engineer",
];

const ADJECTIVES = [
  "Senior",
  "Junior",
  "Lead",
  "Principal",
  "Staff",
  "Associate",
  "Mid-level",
  "Entry-level",
  "Experienced",
  "Expert",
  "Specialist",
  "Consultant",
];

const TECHNOLOGIES = [
  "React",
  "Node.js",
  "Python",
  "TypeScript",
  "JavaScript",
  "Go",
  "Rust",
  "Kubernetes",
  "Docker",
  "AWS",
  "GCP",
  "Azure",
  "PostgreSQL",
  "MongoDB",
];

/**
 * Generate a random company name
 */
export function generateRandomCompany(): string {
  const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
  const timestamp = Date.now();
  return `${company} ${timestamp}`;
}

/**
 * Generate a random position title
 */
export function generateRandomPosition(): string {
  const basePosition = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
  const shouldAddAdjective = Math.random() > 0.6; // 40% chance to add adjective
  const shouldAddTech = Math.random() > 0.7; // 30% chance to add technology
  const timestamp = Date.now();

  let position = basePosition;

  if (shouldAddAdjective) {
    const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    position = `${adjective} ${position}`;
  }

  if (shouldAddTech && position.toLowerCase().includes("developer")) {
    const tech = TECHNOLOGIES[Math.floor(Math.random() * TECHNOLOGIES.length)];
    position = `${tech} ${position}`;
  }

  return `${position} ${timestamp}`;
}

/**
 * Generate a random test application
 */
export function generateRandomApplication() {
  return {
    company: generateRandomCompany(),
    position: generateRandomPosition(),
    date: new Date().toISOString().split("T")[0], // Today's date
    status: "planned",
    link: `https://example.com/job/${Math.floor(Math.random() * 10000)}`,
    notes: `Generated test application for e2e testing - ${new Date().toISOString()}`,
  };
}

// Default test application for backward compatibility
export const TEST_APPLICATION = generateRandomApplication();

// Extended test fixture with page objects
interface TestFixtures {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  addApplicationPage: AddApplicationPage;
  authenticatedPage: Page;
}

// Create extended test with page objects
export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, provide) => {
    const loginPage = new LoginPage(page);
    await provide(loginPage);
  },

  dashboardPage: async ({ page }, provide) => {
    const dashboardPage = new DashboardPage(page);
    await provide(dashboardPage);
  },

  addApplicationPage: async ({ page }, provide) => {
    const addApplicationPage = new AddApplicationPage(page);
    await provide(addApplicationPage);
  },

  // Authenticated page fixture - automatically logs in before each test
  authenticatedPage: async ({ page, loginPage }, provide) => {
    await loginPage.login(TEST_USER.email, TEST_USER.password);
    await provide(page);
  },
});

// Export expect for convenience
export { expect } from "@playwright/test";
