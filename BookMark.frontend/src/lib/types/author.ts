import { Book } from "./book";
import { Genre } from "./genre";

export interface Author {
  id: string;
  name: string;
  biography?: string;
  birthDate?: string;
  deathDate?: string;
  genres?: Genre[];
  books?: Book[];
}

export interface AuthorWithRole {
  id: string;
  roleId: number;
}

export interface AuthorWithNameAndRole {
  id: string;
  name: string;
  roleId: number;
}
