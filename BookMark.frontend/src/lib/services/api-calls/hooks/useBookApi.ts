import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBook,
  getAllBookTypes,
  getBookById,
  getBooksByAuthor,
  getBooksInGenre,
  getConstrainedBooks,
  updateBookAuthors,
  updateBookCoverImage,
  updateBookGenres,
  updateBookMetadata,
} from "../bookApi";
import {
  Book,
  BookCreate,
  BookLinkProps,
  BookType,
  BookUpdate,
} from "@/lib/types/book";
import { ConstrainedQueryParams } from "@/lib/utils";
import { ApiError } from "../api";
import { Page } from "@/lib/types/common";

//--------------------------------------------------------------------------
const KEY_BOOK = "book";
const KEY_BOOKS = "books";
const KEY_BOOKS_BY_AUTHOR = "by_author";
const KEY_CONSTRAINED_BOOKS = "constrained";
const KEY_BOOKS_IN_GENRE = "in_genre";
const KEY_BOOK_TYPES = "book_types";
//--------------------------------------------------------------------------

//--------------------------------------------------------------------------
// QUERIES
export function useBook(id: string) {
  return useQuery<Book, ApiError>({
    queryKey: [KEY_BOOK, id],
    queryFn: () => getBookById(id),
    enabled: !!id,
  });
}

export function useConstrainedBooks(params: ConstrainedQueryParams) {
  return useQuery<Page<BookLinkProps>, ApiError>({
    queryKey: [KEY_BOOKS, KEY_CONSTRAINED_BOOKS, params],
    queryFn: () => getConstrainedBooks(params),
    enabled: !!params,
    staleTime: 1 * (60 * 1000),
    cacheTime: 2 * (60 * 1000),
  });
}

export function useBooksByAuthor(authorId: string, count: number) {
  return useQuery<BookLinkProps[], ApiError>({
    queryKey: [KEY_BOOKS, KEY_BOOKS_BY_AUTHOR, authorId, count],
    queryFn: () => getBooksByAuthor(authorId, count),
    enabled: !!authorId,
  });
}

export function useBooksInGenre(genreId: string, count: number = 10) {
  return useQuery<BookLinkProps[], ApiError>({
    queryKey: [KEY_BOOKS, KEY_BOOKS_IN_GENRE, genreId, count],
    queryFn: () => getBooksInGenre(genreId, count),
    enabled: !!genreId,
  });
}

export function useAllBookTypes() {
  return useQuery<BookType[], ApiError>({
    queryKey: [KEY_BOOK_TYPES],
    queryFn: getAllBookTypes,
  });
}
//--------------------------------------------------------------------------

//--------------------------------------------------------------------------
// MUTATIONS
export function useCreateBook() {
  const queryClient = useQueryClient();

  return useMutation<Book, ApiError, BookCreate>({
    mutationFn: (data) => createBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY_BOOKS] });
    },
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; edits: BookUpdate }>({
    mutationFn: async ({ id, edits }) => {
      const { coverImageFile, genres, authors, ...metadata } = edits;

      const tasks: { name: string; promise: Promise<unknown> }[] = [];

      if (metadata) {
        tasks.push({
          name: "Metadata",
          promise: updateBookMetadata(id, metadata),
        });
      }
      if (coverImageFile !== undefined) {
        tasks.push({
          name: "Cover",
          promise: updateBookCoverImage(id, coverImageFile),
        });
      }
      if (authors) {
        tasks.push({
          name: "Authors",
          promise: updateBookAuthors(
            id,
            authors.map((author) => author.id)
          ),
        });
      }
      if (genres) {
        tasks.push({
          name: "Genres",
          promise: updateBookGenres(
            id,
            genres.map((genre) => genre.id)
          ),
        });
      }

      const results = await Promise.allSettled(tasks.map((t) => t.promise));

      const failedTasks = tasks.filter((_, i) => {
        const r = results[i];
        return (
          r.status === "rejected" ||
          (r.status === "fulfilled" &&
            (r.value as { success?: boolean })?.success === false)
        );
      });

      if (failedTasks.length > 0) {
        const errorMessage = `Failed to update: ${failedTasks
          .map((t) => t.name)
          .join(", ")}`;

        throw new Error(errorMessage);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [KEY_BOOK, variables.id] });
      queryClient.invalidateQueries({ queryKey: [KEY_BOOKS] });
    },
  });
}
//--------------------------------------------------------------------------
