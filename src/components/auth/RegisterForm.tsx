import React from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import type { AuthFormData } from "../../types";
import { RegisterSchema } from "../../types";
import { toast } from "sonner";
import { registerUser } from "../../lib/services/auth.service";

type RegisterFormInputs = AuthFormData;

export const RegisterForm: React.FC = () => {
  const [navigateTo, setNavigateTo] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  React.useEffect(() => {
    if (navigateTo) {
      window.location.href = navigateTo;
    }
  }, [navigateTo]);

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    try {
      await registerUser(data);
      toast.success("Konto utworzone pomyślnie!");

      setNavigateTo("/dashboard");
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
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          id="email"
          type="email"
          {...register("email")}
          disabled={isSubmitting}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
          placeholder="twoj.email@example.com"
          data-testid="register-email-input"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Hasło *
        </label>
        <input
          id="password"
          type="password"
          {...register("password")}
          disabled={isSubmitting}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
          placeholder="Minimum 8 znaków"
          data-testid="register-password-input"
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Potwierdź hasło *
        </label>
        <input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword")}
          disabled={isSubmitting}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.confirmPassword ? "border-red-500 focus:ring-red-500" : "border-gray-300"}`}
          placeholder="Powtórz hasło"
          data-testid="register-confirm-password-input"
        />
        {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button type="submit" disabled={isSubmitting} className="w-full" data-testid="register-submit-btn">
          {isSubmitting ? "Rejestrowanie..." : "Zarejestruj się"}
        </Button>
      </div>

      {/* Links */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Masz już konto?{" "}
          <a href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Zaloguj się
          </a>
        </p>
      </div>
    </form>
  );
};
