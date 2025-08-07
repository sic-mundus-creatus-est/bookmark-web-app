import { apiCall, GET, POST } from "./api";

export function getGenreById(id: string) {
  return apiCall({ method: GET, endpoint: `/api/genres/get/${id}` });
}

export function getAllGenres() {
  return apiCall({ method: GET, endpoint: "/api/genres/get-all" });
}

export function createGenre(data: { name: string; description?: string }) {
  return apiCall({
    method: POST,
    endpoint: "/api/genres/create",
    body: data,
  });
}

export function getBooksWithGenre(id: string, count: number) {
  return apiCall({
    method: "GET",
    endpoint: `/api/genres/${id}/books?count=${count}`,
  });
}
