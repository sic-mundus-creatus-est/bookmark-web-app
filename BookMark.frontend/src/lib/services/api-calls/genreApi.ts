import { EditedGenre } from "@/lib/types/genre";
import { apiCall, GET, PATCH, POST } from "./api";

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

export function updateGenre(id: string, editedData: EditedGenre) {
  return apiCall({
    method: PATCH,
    endpoint: `/api/genres/update/${id}`,
    body: editedData,
  });
}
