import { AuthorLinkProps } from "@/lib/types/author";
import { GenreLinkProps } from "@/lib/types//genre";
import { UserLinkProps } from "./user";

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

  averageRating?: number;
  reviewCount?: number;
}

export interface BookLinkProps {
  id: string;
  title: string;
  authors: AuthorLinkProps[];
  coverImageUrl?: string;

  averageRating?: number;
  reviewCount?: number;
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

export interface BookReview {
  user: UserLinkProps;
  bookId: string;
  bookTitle: string;
  bookCoverImageUrl?: string;
  rating: number;
  content: string;
  createdAt: string;
}
