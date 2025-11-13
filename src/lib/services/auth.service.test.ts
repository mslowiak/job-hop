import { describe, it, expect, vi, afterEach } from "vitest";
import { loginUser, registerUser } from "./auth.service";
import type { AuthFormData } from "../../types";

// Mock fetch globally
global.fetch = vi.fn();

describe("auth.service", () => {
  const mockSuccessResponse = () => ({
    ok: true,
    json: vi
      .fn()
      .mockResolvedValue({ user: { id: 1, email: "test@example.com" } }),
  });

  const mockErrorResponse = (error: string) => ({
    ok: false,
    json: vi.fn().mockResolvedValue({ error }),
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("loginUser", () => {
    it("should successfully login and return user data", async () => {
      vi.mocked(fetch).mockResolvedValue(mockSuccessResponse());

      const data = { email: "test@example.com", password: "password123" };
      const result = await loginUser(data);

      expect(fetch).toHaveBeenCalledWith(
        "/api/auth/login",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
          }),
        }),
      );
      expect(result).toEqual({ user: { id: 1, email: "test@example.com" } });
    });

    it("should throw error for invalid credentials", async () => {
      vi.mocked(fetch).mockResolvedValue(
        mockErrorResponse("Invalid credentials"),
      );

      const data = { email: "test@example.com", password: "wrong" };

      await expect(loginUser(data)).rejects.toThrow(
        "Nieprawidłowy email lub hasło",
      );
    });

    it("should throw error for user already registered", async () => {
      vi.mocked(fetch).mockResolvedValue(
        mockErrorResponse("User already registered"),
      );

      const data = { email: "test@example.com", password: "password123" };

      await expect(loginUser(data)).rejects.toThrow(
        "Email jest już zarejestrowany",
      );
    });

    it("should throw generic error for unknown issues", async () => {
      vi.mocked(fetch).mockResolvedValue(
        mockErrorResponse("Unknown server error"),
      );

      const data = { email: "test@example.com", password: "password123" };

      await expect(loginUser(data)).rejects.toThrow(
        "Coś poszło nie tak. Spróbuj ponownie.",
      );
    });
  });

  describe("registerUser", () => {
    it("should successfully register and return user data", async () => {
      vi.mocked(fetch).mockResolvedValue(mockSuccessResponse());

      const data: AuthFormData = {
        email: "new@example.com",
        password: "password123",
        confirmPassword: "password123",
      };
      const result = await registerUser(data);

      expect(fetch).toHaveBeenCalledWith(
        "/api/auth/register",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "new@example.com",
            password: "password123",
          }),
        }),
      );
      expect(result).toEqual({ user: { id: 1, email: "test@example.com" } });
    });

    it("should throw error for password too short", async () => {
      vi.mocked(fetch).mockResolvedValue(
        mockErrorResponse("Password should be at least 8 characters"),
      );

      const data: AuthFormData = {
        email: "new@example.com",
        password: "short",
        confirmPassword: "short",
      };

      await expect(registerUser(data)).rejects.toThrow(
        "Hasło musi mieć co najmniej 6 znaków",
      );
    });

    it("should throw error for email not confirmed", async () => {
      vi.mocked(fetch).mockResolvedValue(
        mockErrorResponse("Email not confirmed"),
      );

      const data: AuthFormData = {
        email: "new@example.com",
        password: "password123",
        confirmPassword: "password123",
      };

      await expect(registerUser(data)).rejects.toThrow(
        "Email nie został potwierdzony",
      );
    });
  });
});
