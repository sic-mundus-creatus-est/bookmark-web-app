import {
  apiCall,
  GET,
  POST,
  buildConstrainedQueryParams,
  ConstrainedQueryParams,
  PATCH,
  PUT,
} from "@/lib/services/api-calls/api";
import { BookMetadata } from "@/lib/types/book";

export interface CreateBookParams {
  bookTypeId: string;
  title: string;
  authorIds: string[];
  genreIds: string[];
  originalLanguage: string;
  pageCount: number;
  publicationYear?: number;
  description?: string;
  coverImageFile?: File | null;
}
export async function createBook(params: CreateBookParams) {
  const formData = new FormData();

  formData.append("BookTypeId", params.bookTypeId);

  formData.append("Title", params.title);
  formData.append("OriginalLanguage", params.originalLanguage);
  formData.append("PageCount", params.pageCount.toString());

  if (params.publicationYear !== undefined) {
    formData.append("PublicationYear", params.publicationYear.toString());
  }

  if (params.description) {
    formData.append("Description", params.description);
  }

  if (params.coverImageFile) {
    formData.append("CoverImageFile", params.coverImageFile);
  }

  params.authorIds.forEach((id, index) => {
    formData.append(`AuthorIds[${index}]`, id);
  });

  params.genreIds.forEach((id, index) => {
    formData.append(`GenreIds[${index}]`, id);
  });

  return apiCall({
    method: POST,
    endpoint: `/api/books/create`,
    body: formData,
  });
}

export function getBookById(id: string) {
  return apiCall({ method: GET, endpoint: `/api/books/get/${id}` });
}

export function getConstrainedBooks(params: ConstrainedQueryParams) {
  const query = buildConstrainedQueryParams(params);
  return apiCall({
    method: GET,
    endpoint: `/api/books/get-constrained-books?${query}`,
  });
}

export function updateBookMetadata(id: string, metadata: BookMetadata) {
  return apiCall({
    method: PATCH,
    endpoint: `/api/books/update/${id}`,
    body: metadata,
  });
}

export function updateBookCoverImage(id: string, newCover: File | null) {
  const formData = new FormData();

  formData.append("newCover", newCover ?? "");

  return apiCall({
    method: PATCH,
    endpoint: `/api/books/${id}/update-cover-image`,
    body: formData,
  });
}

export function updateBookAuthors(id: string, authorIds: string[]) {
  return apiCall({
    method: PUT,
    endpoint: `/api/books/${id}/replace-authors`,
    body: authorIds,
  });
}

export function updateBookGenres(id: string, genreIds: string[]) {
  return apiCall({
    method: PUT,
    endpoint: `/api/books/${id}/replace-genres`,
    body: genreIds,
  });
}

export function getBooksByAuthor(authorId: string, count: number) {
  return apiCall({
    method: GET,
    endpoint: `/api/books/by/${authorId}?count=${count}`,
  });
}

export function getBooksInGenre(genreId: string, count: number) {
  return apiCall({
    method: GET,
    endpoint: `/api/books/genre/${genreId}?count=${count}`,
  });
}

export function getAllBookTypes() {
  return apiCall({
    method: GET,
    endpoint: "/api/book-types/get-all",
  });
}
