import {
  apiCall,
  GET,
  POST,
  PATCH,
  DELETE,
} from "@/lib/services/api-calls/api";
import {
  Author,
  AuthorCreate,
  AuthorLinkProps,
  AuthorUpdate,
} from "@/lib/types/author";

export function createAuthor(data: AuthorCreate): Promise<Author> {
  return apiCall({
    method: POST,
    endpoint: "/api/authors/create",
    body: data,
  });
}

export function getAuthorById(id: string): Promise<Author> {
  return apiCall({ method: GET, endpoint: `/api/authors/get/${id}` });
}

// export function getConstrainedAuthors(
//   params: ConstrainedQueryParams
// ): Promise<Page<AuthorLinkProps>> {
//   const query = buildConstrainedQueryParams(params);
//   return apiCall({
//     method: GET,
//     endpoint: `/api/authors/get-constrained?${query}`,
//   });
// }

export async function getAuthorSuggestions(
  searchTerm: string,
  skipIds: string[],
  count: number = 5
): Promise<AuthorLinkProps[]> {
  const query = new URLSearchParams();
  query.append("searchTerm", searchTerm);
  query.append("count", count.toString());

  skipIds.forEach((id) => query.append("skipIds", id));

  const url = `/api/authors/get-author-suggestions?${query.toString()}`;

  return apiCall({ method: "GET", endpoint: url });
}

export function updateAuthor(
  id: string,
  editedData: AuthorUpdate
): Promise<Author> {
  return apiCall({
    method: PATCH,
    endpoint: `/api/authors/update/${id}`,
    body: editedData,
  });
}

export function deleteAuthor(authorId: string) {
  return apiCall({
    method: DELETE,
    endpoint: `/api/authors/delete/${authorId}`,
  });
}
