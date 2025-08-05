import {
  apiCall,
  GET,
  POST,
  buildConstrainedQueryParams,
  ConstrainedQueryParams,
  PATCH,
  PUT,
  DELETE,
} from "@/lib/services/api-calls/api";
import { AuthorWithRole } from "@/lib/types/author";
import { CreateBookParams, UpdateBookMetadataParams } from "@/lib/types/book";

export function getBookById(id: string) {
  return apiCall({ method: GET, endpoint: `/api/books/get/${id}` });
}

export async function createBook(params: CreateBookParams) {
  const formData = new FormData();

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

  params.authorsWithRoles.forEach((author, index) => {
    formData.append(`AuthorsWithRoles[${index}].AuthorId`, author.id);
    formData.append(
      `AuthorsWithRoles[${index}].RoleId`,
      author.roleId.toString()
    );
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

export function getConstrainedBooks(params: ConstrainedQueryParams) {
  const query = buildConstrainedQueryParams(params);
  return apiCall({
    method: GET,
    endpoint: `/api/books/get-constrained?${query}`,
  });
}

export function updateBook(params: UpdateBookMetadataParams) {
  console.log(params);
  return apiCall({
    method: PATCH,
    endpoint: `/api/books/update/${params.id}`,
    body: params,
  });
}

export function updateBookCoverImage(id: string, newCover: File) {
  const formData = new FormData();

  formData.append("NewCover", newCover);

  return apiCall({
    method: PATCH,
    endpoint: `/api/books/${id}/update-cover-image`,
    body: formData,
  });
}

export function removeBookCoverImage(id: string) {
  return apiCall({
    method: DELETE,
    endpoint: `/api/books/${id}/remove-cover-image`,
  });
}

export function updateBookAuthors(
  id: string,
  authorsWithRoles: AuthorWithRole[]
) {
  return apiCall({
    method: PUT,
    endpoint: `/api/books/${id}/replace-authors`,
    body: authorsWithRoles,
  });
}

export function updateBookGenres(id: string, genreIds: string[]) {
  return apiCall({
    method: PUT,
    endpoint: `/api/books/${id}/replace-genres`,
    body: genreIds,
  });
}
