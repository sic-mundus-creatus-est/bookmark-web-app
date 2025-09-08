import { Book } from "./book";
import { GenreLinkProps } from "./genre";

export interface Author {
  id: string;
  name: string;
  biography?: string;
  birthYear?: number;
  deathYear?: number;
  genres?: GenreLinkProps[];
  books?: Book[];
}

export interface AuthorLinkProps {
  id: string;
  name: string;
}

export interface EditedAuthor {
  name?: string;
  biography?: string;
  birthYear?: number;
  deathYear?: number;
}
