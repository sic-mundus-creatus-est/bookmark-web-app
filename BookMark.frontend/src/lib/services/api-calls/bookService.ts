import { apiCall } from "./api";

export interface BookQueryParams {
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
  filters?: Record<string, string>;
}

export function getConstrainedBooks({
  pageIndex = 1,
  pageSize = 10,
  sortBy = "",
  sortDescending = false,
  filters = {},
}: BookQueryParams) {
  const queryParams = new URLSearchParams();

  queryParams.append("pageIndex", pageIndex.toString());
  queryParams.append("pageSize", pageSize.toString());
  queryParams.append("sortBy", sortBy);
  queryParams.append("sortDescending", sortDescending.toString());

  for (const [key, value] of Object.entries(filters)) {
    queryParams.append(`filters[${key}]`, value);
  }

  return apiCall(`/books/get-constrained?${queryParams.toString()}`, "GET");
}

export function getBookById(id: string) {
  return apiCall(`/books/get/${id}`, "GET");
}

export const FILE_FETCH_BASE_URL = "http://localhost:5234/Resources/";
