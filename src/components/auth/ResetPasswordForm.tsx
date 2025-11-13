import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { z } from "zod";
import { toast } from "sonner";

const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

interface ResetPasswordFormProps {
  loading?: boolean;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Extract code from URL query parameters (Supabase password reset flow)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      setToken(code);
    } else {
      // Fallback: try to get token from hash fragment (some email clients strip query params)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashCode = hashParams.get("code");
      if (hashCode) {
        setToken(hashCode);
      }
    }
  }, []);

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
    const result = ResetPasswordSchema.safeParse(formData);

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

    if (!validateForm() || !token) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: formData.password,
          code: token,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        toast.error(error || "Wystąpił błąd podczas resetowania hasła");
        return;
      }

      setIsSuccess(true);
      toast.success("Hasło zostało pomyślnie zmienione!");
    } catch (error) {
      toast.error("Błąd połączenia. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nieprawidłowy link
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Link do resetowania hasła jest nieprawidłowy lub wygasł.
        </p>
        <a
          href="/auth/forgot-password"
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          ← Poproś o nowy link
        </a>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Hasło zostało zmienione!
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Możesz teraz zalogować się używając nowego hasła.
        </p>
        <a
          href="/auth/login"
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          ← Przejdź do logowania
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nowe hasło *
        </label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          disabled={isSubmitting}
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

      {/* Confirm Password Field */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Potwierdź nowe hasło *
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
          disabled={isSubmitting}
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

      {/* Submit Button */}
      <div className="pt-4">
        <Button type="submit" disabled={isSubmitting} class="w-full">
          {isSubmitting ? "Ustawianie hasła..." : "Ustaw nowe hasło"}
        </Button>
      </div>

      {/* Links */}
      <div className="text-center">
        <a
          href="/auth/login"
          className="text-sm text-blue-600 hover:text-blue-500 font-medium"
        >
          ← Powrót do logowania
        </a>
      </div>
    </form>
  );
};
