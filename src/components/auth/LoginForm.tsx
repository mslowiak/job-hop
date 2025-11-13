import React from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import type { AuthFormData } from "../../types";
import { LoginSchema } from "../../types";
import { toast } from "sonner";
import { loginUser } from "../../lib/services/auth.service";

type LoginFormInputs = Pick<AuthFormData, "email" | "password">;

export const LoginForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      await loginUser(data);
      toast.success("Zalogowano pomyślnie!");

      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get("redirect") || "/dashboard";
      window.location.href = redirect;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Wystąpił nieznany błąd.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          {...register("email")}
          disabled={isSubmitting}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            errors.email
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
          placeholder="twoj.email@example.com"
          data-testid="login-email-input"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
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
          {...register("password")}
          disabled={isSubmitting}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            errors.password
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
          placeholder="Minimum 8 znaków"
          data-testid="login-password-input"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          data-testid="login-submit-btn"
        >
          {isSubmitting ? "Logowanie..." : "Zaloguj się"}
        </Button>
      </div>

      {/* Links */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600">
          Nie masz konta?{" "}
          <a
            href="/auth/register"
            className="text-blue-600 hover:text-blue-500 font-medium underline"
          >
            Zarejestruj się
          </a>
        </p>
        <p className="text-sm text-gray-600">
          <a
            href="/auth/forgot-password"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Zapomniałeś hasła?
          </a>
        </p>
      </div>
    </form>
  );
};
