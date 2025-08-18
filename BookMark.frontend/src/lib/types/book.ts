import { AuthorLinkProps } from "@/lib/types/author";
import { GenreLinkProps } from "@/lib/types//genre";

export interface Book {
  id: string;
  title: string;
  pageCount: number;
  originalLanguage: string;
  publicationYear?: number;
  description?: string;
  coverImageUrl?: string;

  bookType: BookType;
  authors: AuthorLinkProps[];
  genres: GenreLinkProps[];

  rating?: number;
  ratingCount?: number;
}

export interface EditedBook {
  metadata?: BookMetadata;
  authors?: AuthorLinkProps[];
  genres?: GenreLinkProps[];
  coverImageFile?: File | null;
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
