export type Book = {
  id: string;
  title: string;
  authors: Author[];
  genres?: Genre[];
  publicationYear?: string;
  pageCount?: number;
  originalLanguage?: string;
  description?: string;
  coverImage?: string;
  rating?: number;
  ratingCount?: number;
};

export type Author = {
  id: string;
  firstName: string;
  lastName: string;
  career?: string;
};

export type Genre = {
  id: string;
  name: string;
  description?: string;
};
