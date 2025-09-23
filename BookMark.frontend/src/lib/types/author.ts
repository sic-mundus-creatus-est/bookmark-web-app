import { Book } from "./book";
import { GenreLinkProps } from "./genre";

export interface AuthorCreate {
  name: string;
  biography?: string;
  birthYear?: number;
  deathYear?: number;
}

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

export interface AuthorUpdate {
  name?: string;
  biography?: string;
  birthYear?: number;
  deathYear?: number;
}
