import {
  apiCall,
  GET,
  POST,
  ConstrainedQueryParams,
  buildConstrainedQueryParams,
} from "@/lib/services/api-calls/api";

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

export function createAuthor(data: {
  name: string;
  biography?: string;
  birthDate?: string;
  deathDate?: string;
}) {
  return apiCall({
    method: POST,
    endpoint: "/api/authors/create",
    body: data,
  });
}
