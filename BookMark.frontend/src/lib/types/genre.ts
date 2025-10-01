import { BookLinkProps } from "./book";

export interface Genre {
  id: string;
  name: string;
  description?: string;
  books?: BookLinkProps[];
}

export interface GenreLinkProps {
  id: string;
  name: string;
}

export interface GenreUpdate {
  name?: string;
  description?: string;
}
