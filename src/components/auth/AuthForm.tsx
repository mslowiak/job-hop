import React, { useState } from "react";
import { Button } from "../ui/button";
import type { AuthMode, AuthFormData } from "../../types";
import { LoginSchema, RegisterSchema } from "../../types";

interface AuthFormProps {
  mode: AuthMode;
  onSubmit: (data: AuthFormData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  mode,
  onSubmit,
  loading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState<Partial<AuthFormData>>({
    email: "",
    password: "",
    ...(mode === "register" ? { confirmPassword: "" } : {}),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = mode === "login" ? LoginSchema : RegisterSchema;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const result = schema.safeParse(formData);

    if (result.success) {
      setErrors({});
      return true;
    } else {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        const field = error.path.join(".");
        newErrors[field] = error.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData as AuthFormData);
    } catch (error) {
      console.error("Form submission failed:", error);
      // Error handling is done by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email *
        </label>
        <input
          id="email"
          type="email"
          value={formData.email || ""}
          onChange={(e) => handleInputChange("email", e.target.value)}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            errors.email
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
          placeholder="twoj.email@example.com"
          required
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Hasło *
        </label>
        <input
          id="password"
          type="password"
          value={formData.password || ""}
          onChange={(e) => handleInputChange("password", e.target.value)}
          disabled={isLoading}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            errors.password
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
          placeholder="Minimum 8 znaków"
          required
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      {/* Confirm Password Field (only for register) */}
      {mode === "register" && (
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Potwierdź hasło *
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword || ""}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            disabled={isLoading}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
              errors.confirmPassword
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="Powtórz hasło"
            required
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>
      )}

      {/* Global Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading
            ? mode === "login"
              ? "Logowanie..."
              : "Rejestrowanie..."
            : mode === "login"
            ? "Zaloguj się"
            : "Zarejestruj się"}
        </Button>
      </div>

      {/* Links */}
      <div className="text-center space-y-2">
        {mode === "login" ? (
          <>
            <p className="text-sm text-gray-600">
              Nie masz konta?{" "}
              <a
                href="/register"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Zarejestruj się
              </a>
            </p>
            <p className="text-sm text-gray-600">
              <a
                href="/forgot-password"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Zapomniałeś hasła?
              </a>
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-600">
            Masz już konto?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Zaloguj się
            </a>
          </p>
        )}
      </div>
    </form>
  );
};
