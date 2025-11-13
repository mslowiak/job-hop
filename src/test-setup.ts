import { beforeEach, afterEach, vi, expect } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});
