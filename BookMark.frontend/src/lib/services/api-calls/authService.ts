import { apiCall } from "./api";

export function loginUser(credentials: {
  usernameOrEmail: string;
  password: string;
}) {
  return apiCall("/user/login", "POST", credentials);
}

export function registerUser(data: Record<string, unknown>) {
  return apiCall("/user/create", "POST", data);
}
