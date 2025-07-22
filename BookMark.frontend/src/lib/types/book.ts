import { Author, AuthorWithRole } from "@/lib/types/author";
import { Genre } from "@/lib/types//genre";

export interface Book {
  id: string;
  title: string;
  authors: Author[];
  pageCount: number;
  originalLanguage: string;
  genres?: Genre[];
  publicationYear?: string;
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
  coverImageFile?: File;
}
