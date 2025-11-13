import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { LoginForm } from "./LoginForm";
import { loginUser } from "../../lib/services/auth.service";
import { toast } from "sonner";

// Mock the auth service
vi.mock("../../lib/services/auth.service");

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockToastSuccess = vi.mocked(toast.success);
const mockToastError = vi.mocked(toast.error);

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.href for redirect
    delete window.location;
    window.location = { href: "" } as Location;
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });
  });

  it("should render login form with email and password fields", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hasło/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /zaloguj się/i }),
    ).toBeInTheDocument();
  });

  it("should show validation errors for empty fields on submit", async () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole("button", { name: /zaloguj się/i }));

    await waitFor(() => {
      expect(screen.getByText(/wymagane/i)).toBeInTheDocument(); // Assuming Zod error message for required
    });
  });

  it("should show validation error for invalid email", async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "invalid-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: /zaloguj się/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/nieprawidłowy format email/i),
      ).toBeInTheDocument(); // Adjust based on Zod schema
    });
  });

  it("should call loginUser on successful submit and show success toast", async () => {
    const mockLogin = vi
      .mocked(loginUser)
      .mockResolvedValue({ user: { id: 1 } });
    mockToastSuccess.mockReturnValue();

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/hasło/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /zaloguj się/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockToastSuccess).toHaveBeenCalledWith("Zalogowano pomyślnie!");
    });
  });

  it("should show error toast on login failure", async () => {
    vi.mocked(loginUser).mockRejectedValue(
      new Error("Nieprawidłowy email lub hasło"),
    );
    mockToastError.mockReturnValue();

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/hasło/i), {
      target: { value: "wrong" },
    });

    fireEvent.click(screen.getByRole("button", { name: /zaloguj się/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Nieprawidłowy email lub hasło",
      );
    });
  });

  it("should disable submit button during submission", async () => {
    vi.mocked(loginUser).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/hasło/i), {
      target: { value: "password123" },
    });

    const button = screen.getByRole("button", { name: /zaloguj się/i });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Logowanie...");
  });

  it("should redirect after successful login", async () => {
    vi.mocked(loginUser).mockResolvedValue({ user: { id: 1 } });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/hasło/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /zaloguj się/i }));

    await waitFor(() => {
      expect(window.location.href).toBe("/dashboard");
    });
  });
});
