import React, { useState } from "react";
import { Button } from "../ui/button";
import { z } from "zod";
import { toast } from "sonner";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Wprowadź prawidłowy adres email"),
});

export const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const result = ForgotPasswordSchema.safeParse({ email });

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
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        toast.error(error || "Wystąpił błąd podczas wysyłania emaila");
        return;
      }

      setIsSuccess(true);
      toast.success("Link do resetowania hasła został wysłany na Twój email");
    } catch {
      toast.error("Błąd połączenia. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          Email został wysłany!
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Sprawdź swoją skrzynkę email i kliknij w link, aby zresetować hasło.
        </p>
        <a
          href="/auth/login"
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          ← Powrót do logowania
        </a>
      </div>
    );
  }

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
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
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

      {/* Submit Button */}
      <div className="pt-4">
        <Button type="submit" disabled={isSubmitting} class="w-full">
          {isSubmitting ? "Wysyłanie..." : "Wyślij link resetujący"}
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
