import { apiCall } from "./api";

export function loginUser(credentials: {
  usernameOrEmail: string;
  password: string;
}) {
  return apiCall("/auth/login", "POST", credentials);
}

export function registerUser(data: Record<string, unknown>) {
  return apiCall("/auth/register", "POST", data);
}
