import { useEffect, useState } from "react";

import { Book } from "@/lib/types/book";
import { Author } from "@/lib/types/author";
import { BookCard, BookCardPlaceholder } from "@/components/ui/book-card";
import { Pagination } from "@/components/pagination";

interface BookCatalogProps {
  itemsPerPage?: number;
  fetchBooks: (
    page: number,
    limit: number
  ) => Promise<{
    items: Book[];
    pageIndex: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  }>;
}

/**
 * A responsive catalog component that displays book cards in a paginated grid layout.
 */
export function BookCatalog({
  fetchBooks,
  itemsPerPage = 12,
}: BookCatalogProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  function mapBooks(items: any[]): Book[] {
    return (items ?? []).map(
      (book): Book => ({
        id: book.id,
        title: book.title,
        authors: book.authors?.map((a: Author) => a),
        originalLanguage: book.originalLanguage,
        pageCount: book.pageCount,
        description: book.description,
        coverImage: book.coverImage,
        rating: Math.random() * 2 + 3, // TODO
        ratingCount: Math.floor(Math.random() * 1000), // TODO
      })
    );
  }

  useEffect(() => {
    const loadCatalog = async () => {
      setLoading(true);
      try {
        const response = await fetchBooks(currentPage, itemsPerPage);

        const books: Book[] = mapBooks(response.items);

        setBooks(books);
        setTotalPages(response.totalPages);
      } catch (error: any) {
        console.error(
          `ERROR WHILE FETCHING BOOKS:`,
          `\n----------------------------------`,
          `\n[${error.instance}]`,
          `\nError: ${error.status}`,
          `\n----------------------------------`,
          `\nType: ${error.type}`,
          `\nTitle: ${error.title}`,
          `\nDetail: ${error.detail}`,
          `\nTrace ID: ${error.traceId}`
        );
      } finally {
        setLoading(false);
      }
    };

    loadCatalog();
  }, [currentPage, itemsPerPage, fetchBooks]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-4 justify-items-center">
        {loading
          ? Array.from({ length: itemsPerPage }).map((_, i) => (
              <BookCardPlaceholder key={`loading-placeholder-${i}`} />
            ))
          : books.map((book) => (
              <div key={book.id} className="aspect-[2/3] w-full max-w-xs">
                <BookCard book={book} />
              </div>
            ))}
      </div>

      {totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
