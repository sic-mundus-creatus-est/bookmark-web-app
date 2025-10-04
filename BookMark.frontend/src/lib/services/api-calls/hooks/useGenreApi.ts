import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createGenre,
  getAllGenres,
  getGenreById,
  getGenresByAuthor,
  updateGenre,
} from "../genreApi";
import { Genre, GenreLinkProps, GenreUpdate } from "@/lib/types/genre";
import { ApiError } from "../api";

const KEY_GENRE = "genre";
const KEY_GENRES = "genres";
const KEY_ALL_GENRES = "all";
const KEY_GENRES_BY_AUTHOR = "by_author";

//--------------------------------------------------------------------------
// QUERIES
export function useGenreById(id: string) {
  return useQuery<Genre, ApiError>({
    queryKey: [KEY_GENRE, id],
    queryFn: () => getGenreById(id),
    enabled: !!id,
  });
}

export function useAllGenres() {
  return useQuery<GenreLinkProps[], ApiError>({
    queryKey: [KEY_GENRES, KEY_ALL_GENRES],
    queryFn: getAllGenres,
  });
}

export function useGenresByAuthor(authorId: string) {
  return useQuery<GenreLinkProps[], ApiError>({
    queryKey: [KEY_GENRES, KEY_GENRES_BY_AUTHOR, authorId],
    queryFn: () => getGenresByAuthor(authorId),
    enabled: !!authorId,
  });
}
//--------------------------------------------------------------------------

//--------------------------------------------------------------------------
// MUTATIONS
export function useCreateGenre() {
  const queryClient = useQueryClient();

  return useMutation<Genre, ApiError, { name: string; description?: string }>({
    mutationFn: (data: { name: string; description?: string }) =>
      createGenre(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY_GENRES] });
    },
  });
}

export function useUpdateGenre() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { id: string; data: GenreUpdate }>({
    mutationFn: ({ id, data }) => updateGenre(id, data),
    onSuccess: (_, variables) => {
      const { id } = variables;
      queryClient.invalidateQueries({ queryKey: [KEY_GENRE, id] });
      queryClient.invalidateQueries({ queryKey: [KEY_GENRES] });
    },
  });
}
//--------------------------------------------------------------------------
