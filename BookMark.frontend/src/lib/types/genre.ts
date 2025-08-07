import { Book } from "./book";

export interface Genre {
  id: string;
  name: string;
  description?: string;
  books?: Book[];
}
