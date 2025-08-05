import { AuthorWithNameAndRole, AuthorWithRole } from "@/lib/types/author";
import { Genre } from "@/lib/types//genre";

export interface Book {
  id: string;
  title: string;
  authors: AuthorWithNameAndRole[];
  pageCount: number;
  originalLanguage: string;
  genres?: Genre[];
  publicationYear?: number;
  description?: string;
  coverImage?: string;
  rating?: number;
  ratingCount?: number;
}

export interface CreateBookParams {
  title: string;
  authorsWithRoles: AuthorWithRole[];
  genreIds: string[];
  originalLanguage: string;
  pageCount: number;
  publicationYear?: number;
  description?: string;
  coverImageFile?: File | null;
}

export interface UpdateBookMetadataParams {
  id: string;
  title?: string;
  originalLanguage?: string;
  publicationYear?: number;
  pageCount?: number;
  description?: string;
}

export interface EditedBookData {
  id: string;
  title?: string;
  originalLanguage?: string;
  publicationYear?: number;
  pageCount?: number;
  description?: string;
  authors?: AuthorWithNameAndRole[];
  genres?: Genre[];
  coverImageFile?: File | null;
}
