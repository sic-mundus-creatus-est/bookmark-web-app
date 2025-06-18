import { Author } from "@/lib/types/author";
import { Genre } from "@/lib/types//genre";

export interface Book {
  id: string;
  title: string;
  authors: Author[];
  pageCount: number;
  originalLanguage: string;
  genres?: Genre[];
  publicationYear?: string;
  description?: string;
  coverImage?: string;
  rating?: number;
  ratingCount?: number;
}
