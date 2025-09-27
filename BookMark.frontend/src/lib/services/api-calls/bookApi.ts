import { apiCall, GET, POST, PATCH, PUT } from "@/lib/services/api-calls/api";
import {
  Book,
  BookCreate,
  BookLinkProps,
  BookMetadata,
  BookType,
} from "@/lib/types/book";
import { Page } from "@/lib/types/common";
import {
  buildConstrainedQueryParams,
  ConstrainedQueryParams,
} from "@/lib/utils";

export async function createBook(data: BookCreate): Promise<Book> {
  const formData = new FormData();

  formData.append("BookTypeId", data.bookType.id);

  formData.append("Title", data.title);
  formData.append("OriginalLanguage", data.originalLanguage);
  formData.append("PageCount", data.pageCount.toString());

  if (data.publicationYear !== undefined)
    formData.append("PublicationYear", data.publicationYear.toString());

  if (data.description) formData.append("Description", data.description);

  if (data.coverImageFile)
    formData.append("CoverImageFile", data.coverImageFile);

  const authorIds = data.authors.map((author) => author.id);
  authorIds.forEach((id, index) => {
    formData.append(`AuthorIds[${index}]`, id);
  });

  const genreIds = data.genres.map((genre) => genre.id);
  genreIds.forEach((id, index) => {
    formData.append(`GenreIds[${index}]`, id);
  });

  return apiCall({
    method: POST,
    endpoint: `/api/books/create`,
    body: formData,
  });
}

export function getBookById(id: string): Promise<Book> {
  return apiCall({ method: GET, endpoint: `/api/books/get/${id}` });
}

export function getConstrainedBooks(
  params: ConstrainedQueryParams
): Promise<Page<BookLinkProps>> {
  const query = buildConstrainedQueryParams(params);
  return apiCall({
    method: GET,
    endpoint: `/api/books/get-constrained-books?${query}`,
  });
}

export function updateBookMetadata(
  id: string,
  metadata: BookMetadata
): Promise<void> {
  return apiCall({
    method: PATCH,
    endpoint: `/api/books/update/${id}`,
    body: metadata,
  });
}

export function updateBookCoverImage(
  id: string,
  newCover: File | null
): Promise<void> {
  const formData = new FormData();

  formData.append("newCover", newCover ?? "");

  return apiCall({
    method: PATCH,
    endpoint: `/api/books/${id}/update-cover-image`,
    body: formData,
  });
}

export function updateBookAuthors(
  bookId: string,
  authorIds: string[]
): Promise<void> {
  return apiCall({
    method: PUT,
    endpoint: `/api/books/${bookId}/replace-authors`,
    body: authorIds,
  });
}

export function updateBookGenres(
  bookId: string,
  genreIds: string[]
): Promise<void> {
  return apiCall({
    method: PUT,
    endpoint: `/api/books/${bookId}/replace-genres`,
    body: genreIds,
  });
}

export function getBooksByAuthor(
  authorId: string,
  count: number = 10
): Promise<BookLinkProps[]> {
  return apiCall({
    method: GET,
    endpoint: `/api/books/by/${authorId}?count=${count}`,
  });
}

export function getBooksInGenre(
  genreId: string,
  count: number
): Promise<BookLinkProps[]> {
  return apiCall({
    method: GET,
    endpoint: `/api/books/genre/${genreId}?count=${count}`,
  });
}

export function getAllBookTypes(): Promise<BookType[]> {
  return apiCall({
    method: GET,
    endpoint: "/api/book-types/get-all",
  });
}
