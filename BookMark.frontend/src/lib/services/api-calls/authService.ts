import { apiCall, POST } from "@/lib/services/api-calls/api";

export function loginUser(credentials: {
  usernameOrEmail: string;
  password: string;
}) {
  return apiCall({
    method: POST,
    endpoint: "/user/login",
    body: credentials,
  });
}

export function registerUser(data: Record<string, unknown>) {
  return apiCall({ method: POST, endpoint: "/user/create", body: data });
}
