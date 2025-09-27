import { Genre, GenreLinkProps, GenreUpdate } from "@/lib/types/genre";
import { apiCall, GET, PATCH, POST } from "./api";

export function createGenre(data: {
  name: string;
  description?: string;
}): Promise<Genre> {
  return apiCall({
    method: POST,
    endpoint: "/api/genres/create",
    body: data,
  });
}

export function getGenreById(id: string): Promise<Genre> {
  return apiCall({ method: GET, endpoint: `/api/genres/get/${id}` });
}

export function getAllGenres(): Promise<GenreLinkProps[]> {
  return apiCall({ method: GET, endpoint: "/api/genres/get-all" });
}

export function getGenresByAuthor(authorId: string): Promise<GenreLinkProps[]> {
  return apiCall({
    method: GET,
    endpoint: `/api/genres/by/${authorId}`,
  });
}

export function updateGenre(
  id: string,
  editedData: GenreUpdate
): Promise<void> {
  return apiCall({
    method: PATCH,
    endpoint: `/api/genres/update/${id}`,
    body: editedData,
  });
}
