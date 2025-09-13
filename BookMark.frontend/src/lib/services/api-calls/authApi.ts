import { apiCall, POST } from "@/lib/services/api-calls/api";
import { UserCreate } from "@/lib/types/user";

export function signInUser(credentials: {
  usernameOrEmail: string;
  password: string;
}) {
  return apiCall({
    method: POST,
    endpoint: "/api/users/signin",
    body: credentials,
  });
}

export function createUser(data: UserCreate) {
  return apiCall({ method: POST, endpoint: "/api/users/create", body: data });
}
