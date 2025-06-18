import { apiCall, GET } from "./api";

export function getGenreById(id: string) {
  return apiCall({ method: GET, endpoint: `/api/genres/get/${id}` });
}

export function getAllGenres() {
  return apiCall({ method: GET, endpoint: "/api/genres/get-all" });
}
