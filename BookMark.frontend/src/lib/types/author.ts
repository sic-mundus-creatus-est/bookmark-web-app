import { Book } from "./book";
import { GenreLinkProps } from "./genre";

export interface Author {
  id: string;
  name: string;
  biography?: string;
  birthDate?: string;
  deathDate?: string;
  genres?: GenreLinkProps[];
  books?: Book[];
}

export interface AuthorLinkProps {
  id: string;
  name: string;
}
