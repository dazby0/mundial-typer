import { LoginInput, RegisterInput } from "../schemas/auth.schema";

type AuthResponse = {
  user?: unknown;
  error?: string;
};

async function handleAuthResponse(response: Response): Promise<AuthResponse> {
  const data = await response.json();

  if (!response.ok) {
    return {
      error: data.error || "Something went wrong.",
    };
  }

  return data;
}

export async function registerUser(input: RegisterInput) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return handleAuthResponse(response);
}

export async function loginUser(input: LoginInput) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  return handleAuthResponse(response);
}
