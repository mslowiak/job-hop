import type { AuthFormData } from "../../types";

const parseAuthError = (error: string): string => {
  if (error.includes("Invalid login") || error.includes("Invalid credentials")) {
    return "Nieprawidłowy email lub hasło";
  }
  if (error.includes("User already registered")) {
    return "Email jest już zarejestrowany";
  }
  if (error.includes("Password should be at least")) {
    return "Hasło musi mieć co najmniej 6 znaków";
  }
  if (error.includes("Email not confirmed")) {
    return "Email nie został potwierdzony";
  }
  return "Coś poszło nie tak. Spróbuj ponownie.";
};

const postAuth = async (endpoint: string, data: Partial<AuthFormData>) => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: data.email, password: data.password }),
  });

  if (!response.ok) {
    const { error } = await response.json();
    const errorMessage = parseAuthError(error);
    throw new Error(errorMessage);
  }

  return response.json();
};

export const loginUser = (data: Pick<AuthFormData, "email" | "password">) => {
  return postAuth("/api/auth/login", data);
};

export const registerUser = (data: AuthFormData) => {
  return postAuth("/api/auth/register", data);
};
