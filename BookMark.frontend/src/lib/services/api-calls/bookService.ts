import {
  apiCall,
  GET,
  POST,
  buildConstrainedQueryParams,
  ConstrainedQueryParams,
} from "@/lib/services/api-calls/api";
import { AuthorWithRole } from "@/lib/types/author";

export function getBookById(id: string) {
  return apiCall({ method: GET, endpoint: `/api/books/get/${id}` });
}

interface CreateBookParams {
  title: string;
  authorsWithRoles: AuthorWithRole[];
  genreIds: string[];
  originalLanguage: string;
  pageCount: number;
  publicationYear?: number;
  description?: string;
  coverImageFile?: File;
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
    formData.append(`AuthorsWithRoles[${index}].AuthorId`, author.authorId);
    formData.append(
      `AuthorsWithRoles[${index}].Role`,
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
