import {
  apiCall,
  GET,
  POST,
  ConstrainedQueryParams,
  buildConstrainedQueryParams,
  PATCH,
} from "@/lib/services/api-calls/api";
import { EditedAuthor } from "@/lib/types/author";

export function createAuthor(data: {
  name: string;
  biography?: string;
  birthYear?: number;
  deathYear?: number;
}) {
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

export function updateAuthor(id: string, editedData: EditedAuthor) {
  return apiCall({
    method: PATCH,
    endpoint: `/api/authors/update/${id}`,
    body: editedData,
  });
}
