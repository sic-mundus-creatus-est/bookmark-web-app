import { Book } from "./book";

export interface Genre {
  id: string;
  name: string;
  description?: string;
  books?: Book[];
}

export interface GenreLinkProps {
  id: string;
  name: string;
}

export interface GenreUpdate {
  name?: string;
  description?: string;
}
