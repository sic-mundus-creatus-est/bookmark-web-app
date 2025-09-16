import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Pagination } from "@/components/pagination";
import { BookCard } from "@/components/ui/book/book-card";
import { getConstrainedBooks } from "@/lib/services/api-calls/bookApi";
import { Book } from "@/lib/types/book";
import { useLoading } from "@/lib/contexts/useLoading";

export function BooksPage() {
  //------------------------------------------------------------------------------
  const { showLoadingScreen, hideLoadingScreen } = useLoading();
  const [searchParams, setSearchParams] = useSearchParams();
  //------------------------------------------------------------------------------

  //------------------------------------------------------------------------------
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  //------------------------------------------------------------------------------

  //------------------------------------------------------------------------------
  const [books, setBooks] = useState<Book[]>([]);
  //------------------------------------------------------------------------------

  const handlePageChangeFromUI = (newPage: number) => {
    const validatedPage = Math.max(1, Math.min(newPage, totalPages));
    console.log(validatedPage);
    setSearchParams({ page: validatedPage.toString() });
  };

  const getValidPageFromUrl = useCallback(() => {
    const pageParam = searchParams.get("page");
    const pageNumber = parseInt(pageParam || "1", 10);
    return isNaN(pageNumber) ? 1 : Math.max(1, pageNumber);
  }, [searchParams]);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        showLoadingScreen();
        const pageToLoad = getValidPageFromUrl();

        if (pageToLoad !== parseInt(searchParams.get("page") || "1", 10)) {
          setSearchParams({ page: pageToLoad.toString() });
          return;
        }

        const response = await getConstrainedBooks({
          pageIndex: pageToLoad,
          pageSize: 12,
        });

        if (response.items.length === 0) {
          if (pageToLoad !== 1) {
            setSearchParams({ page: "1" });
            return;
          }
          setBooks([]);
          setTotalPages(1);
          setCurrentPage(1);
          return;
        }

        if (pageToLoad > response.totalPages) {
          setSearchParams({ page: response.totalPages.toString() });
          return;
        }

        setBooks(response.items);
        setTotalPages(response.totalPages);
        setCurrentPage(pageToLoad);
      } catch (error) {
        console.error("Failed to load books:", error);
        setSearchParams({ page: "1" });
      } finally {
        hideLoadingScreen();
      }
    };

    loadBooks();
  }, [
    searchParams,
    getValidPageFromUrl,
    setSearchParams,
    showLoadingScreen,
    hideLoadingScreen,
  ]);

  return (
    <div className="pt-4">
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
          {books.map((book) => (
            <div key={book.id} className="aspect-[2/3] w-full max-w-xs">
              <BookCard book={book} />
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChangeFromUI}
          />
        )}
      </div>
    </div>
  );
}
