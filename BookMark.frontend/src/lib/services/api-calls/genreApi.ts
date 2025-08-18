import { apiCall, GET, POST } from "./api";

export function createGenre(data: { name: string; description?: string }) {
  return apiCall({
    method: POST,
    endpoint: "/api/genres/create",
    body: data,
  });
}

export function getGenreById(id: string) {
  return apiCall({ method: GET, endpoint: `/api/genres/get/${id}` });
}

export function getAllGenres() {
  return apiCall({ method: GET, endpoint: "/api/genres/get-all" });
}

export function getGenresByAuthor(authorId: string) {
  return apiCall({
    method: GET,
    endpoint: `/api/genres/by/${authorId}`,
  });
}
