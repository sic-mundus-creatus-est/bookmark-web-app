import { useEffect, useState } from "react";
import { BookCard, BookCardPlaceholder } from "@/components/ui/book-card";
import { Pagination } from "@/components/pagination";
import { Book } from "@/components/ui/book-card";

interface BookCatalogProps {
  itemsPerPage?: number;
  fetchBooks: (
    page: number,
    limit: number
  ) => Promise<{
    books: Book[];
    totalItems: number;
  }>;
  className?: string;
}

/**
 * A responsive catalog component that displays book cards in a paginated grid layout.
 */
export function BookCatalog({
  fetchBooks,
  itemsPerPage = 14,
}: BookCatalogProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { books, totalItems } = await fetchBooks(
          currentPage,
          itemsPerPage
        );
        setBooks(books);
        setTotalItems(totalItems); // now this works!!!
      } catch (error) {
        console.error("Failed to fetch books", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentPage, itemsPerPage, fetchBooks]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 justify-items-center px-4">
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

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
