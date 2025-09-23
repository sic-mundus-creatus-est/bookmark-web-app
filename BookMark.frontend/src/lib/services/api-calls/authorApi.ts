import { apiCall, GET, POST, PATCH } from "@/lib/services/api-calls/api";
import { AuthorCreate, AuthorUpdate } from "@/lib/types/author";
import {
  buildConstrainedQueryParams,
  ConstrainedQueryParams,
} from "@/lib/utils";

export function createAuthor(data: AuthorCreate) {
  return apiCall({
    method: POST,
    endpoint: "/api/authors/create",
    body: data,
  });
}

export function getAuthorById(id: string) {
  return apiCall({ method: GET, endpoint: `/api/authors/get/${id}` });
}

export function getConstrainedAuthors(params: ConstrainedQueryParams) {
  const query = buildConstrainedQueryParams(params);
  return apiCall({
    method: GET,
    endpoint: `/api/authors/get-constrained?${query}`,
  });
}

export function updateAuthor(id: string, editedData: AuthorUpdate) {
  return apiCall({
    method: PATCH,
    endpoint: `/api/authors/update/${id}`,
    body: editedData,
  });
}

export async function authorSuggestions(searchTerm: string, count: number = 5) {
  const result = await getConstrainedAuthors({
    filters: { "Name~=": searchTerm },
    pageIndex: 1,
    pageSize: count,
  });
  return result.items ?? [];
}
