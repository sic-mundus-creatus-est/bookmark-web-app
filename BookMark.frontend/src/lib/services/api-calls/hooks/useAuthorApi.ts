import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  authorSuggestions,
  createAuthor,
  getAuthorById,
  getConstrainedAuthors,
  updateAuthor,
} from "../authorApi";
import {
  Author,
  AuthorCreate,
  AuthorLinkProps,
  AuthorUpdate,
} from "@/lib/types/author";
import { ConstrainedQueryParams } from "@/lib/utils";
import { ApiError } from "../api";

const KEY_AUTHOR = "author";
const KEY_AUTHORS = "authors";
const KEY_CONSTRAINED_AUTHORS = "constrained";

//--------------------------------------------------------------------------
// QUERIES
export function useAuthor(id: string) {
  return useQuery<Author, ApiError>({
    queryKey: [KEY_AUTHOR, id],
    queryFn: () => getAuthorById(id),
    enabled: !!id,
  });
}

export function useConstrainedAuthors(params: ConstrainedQueryParams) {
  return useQuery<Author[], ApiError>({
    queryKey: [KEY_AUTHORS, KEY_CONSTRAINED_AUTHORS, params],
    queryFn: () => getConstrainedAuthors(params),
    enabled: !!params,
  });
}

export function useAuthorSuggestions(searchTerm: string) {
  return useQuery<AuthorLinkProps[], ApiError>({
    queryKey: [KEY_AUTHORS, searchTerm],
    queryFn: () => authorSuggestions(searchTerm),
    enabled: searchTerm.trim() !== "",
    keepPreviousData: false,
    staleTime: 1 * (60 * 1000),
    cacheTime: 5 * (60 * 1000),
  });
}
//--------------------------------------------------------------------------

//--------------------------------------------------------------------------
// MUTATIONS
export function useCreateAuthor() {
  const queryClient = useQueryClient();

  return useMutation<Author, ApiError, AuthorCreate>({
    mutationFn: createAuthor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY_AUTHORS] });
    },
  });
}

export function useUpdateAuthor() {
  const queryClient = useQueryClient();

  return useMutation<Author, ApiError, { id: string; data: AuthorUpdate }>({
    mutationFn: ({ id, data }) => updateAuthor(id, data),
    onSuccess: (_, variables) => {
      const { id } = variables;
      queryClient.invalidateQueries({ queryKey: [KEY_AUTHOR, id] });
      queryClient.invalidateQueries({ queryKey: [KEY_AUTHORS] });
    },
  });
}
//--------------------------------------------------------------------------
