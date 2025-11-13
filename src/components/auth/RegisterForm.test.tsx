import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { RegisterForm } from "./RegisterForm";
import { registerUser } from "../../lib/services/auth.service";

// Mock the auth service
vi.mock("../../lib/services/auth.service");

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockToast = vi.mocked(require("sonner").toast);

describe("RegisterForm", () => {
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

  it("should render register form with email, password, and confirm password fields", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/hasło/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/potwierdź hasło/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /zarejestruj się/i }),
    ).toBeInTheDocument();
  });

  it("should show validation errors for empty fields on submit", async () => {
    render(<RegisterForm />);

    fireEvent.click(screen.getByRole("button", { name: /zarejestruj się/i }));

    await waitFor(() => {
      expect(screen.getByText(/wymagane/i)).toBeInTheDocument(); // Zod required error
    });
  });

  it("should show validation error for password mismatch", async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/hasło/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/potwierdź hasło/i), {
      target: { value: "different" },
    });

    fireEvent.click(screen.getByRole("button", { name: /zarejestruj się/i }));

    await waitFor(() => {
      expect(screen.getByText(/hasła nie pasują/i)).toBeInTheDocument(); // Assuming Zod error for confirmPassword
    });
  });

  it("should call registerUser on successful submit and show success toast", async () => {
    const mockRegister = vi
      .mocked(registerUser)
      .mockResolvedValue({ user: { id: 1 } });
    mockToast.success.mockReturnValue();

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "new@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/hasło/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/potwierdź hasło/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /zarejestruj się/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "password123",
        confirmPassword: "password123",
      });
      expect(mockToast.success).toHaveBeenCalledWith(
        "Konto utworzone pomyślnie!",
      );
    });
  });

  it("should show error toast on registration failure", async () => {
    vi.mocked(registerUser).mockRejectedValue(
      new Error("Email jest już zarejestrowany"),
    );
    mockToast.error.mockReturnValue();

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "existing@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/hasło/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/potwierdź hasło/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /zarejestruj się/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Email jest już zarejestrowany",
      );
    });
  });

  it("should disable submit button during submission", async () => {
    vi.mocked(registerUser).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "new@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/hasło/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/potwierdź hasło/i), {
      target: { value: "password123" },
    });

    const button = screen.getByRole("button", { name: /zarejestruj się/i });
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Rejestrowanie...");
  });

  it("should redirect after successful registration", async () => {
    vi.mocked(registerUser).mockResolvedValue({ user: { id: 1 } });

    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "new@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/hasło/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/potwierdź hasło/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /zarejestruj się/i }));

    await waitFor(() => {
      expect(window.location.href).toBe("/dashboard");
    });
  });
});
