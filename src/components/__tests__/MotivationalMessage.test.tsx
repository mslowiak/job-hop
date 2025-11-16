import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MotivationalMessage } from "../MotivationalMessage";

describe("MotivationalMessage", () => {
  // Mock fetch globally
  global.fetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading spinner initially", async () => {
    // Mock to resolve immediately but empty to trigger error after
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    render(<MotivationalMessage />);

    // Assert initial loading state synchronously
    const blockquote = screen.getByRole("blockquote");
    expect(blockquote).toBeInTheDocument();

    // Check for spinner container
    const spinnerContainer = screen.getByText("Generating your daily motivation...").parentElement;
    expect(spinnerContainer).toHaveClass("flex");
    expect(spinnerContainer).toHaveClass("items-center");
    expect(spinnerContainer).toHaveClass("justify-center");
    expect(spinnerContainer).toHaveClass("space-x-2");

    // Check for spinner element
    const spinner = screen.getByText("Generating your daily motivation...").previousElementSibling;
    expect(spinner).toHaveClass("animate-spin");
    expect(spinner).toHaveClass("rounded-full");
    expect(spinner).toHaveClass("h-4");
    expect(spinner).toHaveClass("w-4");
    expect(spinner).toHaveClass("border-b-2");
    expect(spinner).toHaveClass("border-gray-900");

    // Check for loading text
    const loadingText = screen.getByText("Generating your daily motivation...");
    expect(loadingText).toHaveClass("text-gray-500");
    expect(loadingText).toHaveClass("italic");
    expect(loadingText).toHaveClass("text-sm");

    // Wait for fetch to confirm it was called
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/messages/daily-motivation");
    });
  });

  it("renders success state with message and accessibility attributes", async () => {
    const mockMessage = "Test motivational message";
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: mockMessage }),
    } as Response);

    render(<MotivationalMessage />);

    // Wait for message to appear (success state)
    await waitFor(() => {
      expect(screen.getByText(mockMessage)).toBeInTheDocument();
    });

    const statusBlockquote = screen.getByRole("status");
    expect(statusBlockquote).toHaveAttribute("aria-live", "polite");
    expect(statusBlockquote).toHaveClass("bg-gray-50");
    expect(statusBlockquote).toHaveClass("border");
    expect(statusBlockquote).toHaveClass("rounded-lg");
  });

  it("renders nothing on error", async () => {
    const mockError = new Error("Network error");
    fetch.mockRejectedValue(mockError);

    render(<MotivationalMessage />);

    await waitFor(
      () => {
        expect(screen.queryByRole("blockquote")).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    expect(fetch).toHaveBeenCalledWith("/api/messages/daily-motivation");
    // Removed console.error assertion as logging is no longer present
  });

  it("renders nothing when message is empty", async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: "" }),
    } as Response);

    render(<MotivationalMessage />);

    await waitFor(() => {
      expect(screen.queryByRole("blockquote")).not.toBeInTheDocument();
    });
  });

  it("does not re-fetch on re-render due to memoization", async () => {
    const mockMessage = "Test message";
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: mockMessage }),
    } as Response);

    const { rerender } = render(<MotivationalMessage />);

    await waitFor(() => {
      expect(screen.getByText(mockMessage)).toBeInTheDocument();
    });

    // Re-render without changing props
    rerender(<MotivationalMessage />);

    // Fetch should only be called once (memoization prevents re-mount)
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
