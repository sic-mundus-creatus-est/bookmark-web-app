const API_BASE_URL = "http://localhost:5234/api";

export async function apiCall(
  endpoint: string,
  method: string = "GET",
  body: unknown
) {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  return response.json();
}
