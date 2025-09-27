import { AuthorLinkProps } from "@/lib/types/author";
import { GenreLinkProps } from "@/lib/types//genre";

export interface BookCreate {
  bookType: BookType;
  title: string;
  authors: AuthorLinkProps[];
  genres: GenreLinkProps[];
  originalLanguage: string;
  pageCount: number;
  publicationYear: number;
  description?: string;
  coverImageFile?: File | null;
}

export interface Book {
  id: string;
  title: string;
  publicationYear: number;
  pageCount: number;
  originalLanguage: string;
  description?: string;

  coverImageUrl?: string;

  bookType: BookType;
  authors: AuthorLinkProps[];
  genres: GenreLinkProps[];

  rating?: number;
  ratingCount?: number;
}

export interface BookLinkProps {
  id: string;
  title: string;
  authors: AuthorLinkProps[];
  coverImageUrl?: string;

  rating?: number;
}

export interface BookUpdate {
  title?: string;
  publicationYear?: number;
  pageCount?: number;
  originalLanguage?: string;
  description?: string;

  coverImageFile?: File | null;

  bookType?: BookType;
  authors?: AuthorLinkProps[];
  genres?: GenreLinkProps[];
}

export interface BookMetadata {
  bookTypeId?: string;
  title?: string;
  originalLanguage?: string;
  publicationYear?: number;
  pageCount?: number;
  description?: string;
}

export interface BookType {
  id: string;
  name: string;
}
