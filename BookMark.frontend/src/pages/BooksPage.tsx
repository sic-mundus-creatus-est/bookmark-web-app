import { useEffect } from "react";
import { useMatches, useSearchParams } from "react-router-dom";

import { Pagination } from "@/components/pagination";
import { BookCard } from "@/components/ui/book/book-card";
import { useLoading } from "@/lib/contexts/useLoading";
import { BookLinkProps } from "@/lib/types/book";
import { useConstrainedBooks } from "@/lib/services/api-calls/hooks/useBookApi";

const PAGE_SIZE = 12;

export function BooksPage() {
  //------------------------------------------------------------------------------
  const { showLoadingScreen, hideLoadingScreen } = useLoading();
  //------------------------------------------------------------------------------
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = isNaN(pageParam) ? 1 : Math.max(1, pageParam);

  const matches = useMatches();
  console.log(matches[1].handle);
  const bookType: string = (matches[1].handle as string) ?? undefined;

  //------------------------------------------------------------------------------
  const {
    data: page,
    isFetching: fetching,
    error,
  } = useConstrainedBooks(
    {
      pageIndex: currentPage,
      pageSize: PAGE_SIZE,
    },
    bookType ? [bookType] : undefined
  );
  //------------------------------------------------------------------------------
  useEffect(() => {
    if (fetching) {
      showLoadingScreen();
    } else {
      hideLoadingScreen();
    }
  }, [fetching, showLoadingScreen, hideLoadingScreen]);

  useEffect(() => {
    if (!fetching) {
      if (error) setSearchParams({ page: "1" });
      else if (page)
        if (page.items?.length === 0 && currentPage !== 1)
          setSearchParams({ page: "1" });
    }
  }, [page, currentPage, error, fetching, setSearchParams]);
  //------------------------------------------------------------------------------

  //==============================================================================
  const handlePageChangeFromUI = (newPage: number) => {
    if (!error) {
      const validatedPage = Math.max(
        1,
        Math.min(newPage, page?.totalPages || 1)
      );
      setSearchParams({ page: validatedPage.toString() });
    }
  }; //==============================================================================

  if (error)
    return (
      <div className="text-center p-10 text-lg font-mono text-destructive">
        No books here.
      </div>
    );
  return (
    <div className="w-full pt-4 pb-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-4 mb-2">
        {page?.items?.map((book: BookLinkProps) => (
          <div key={book.id} className="aspect-[2/3] w-full max-w-xs">
            <BookCard book={book} />
          </div>
        ))}
      </div>

      {page && page.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={page.totalPages}
          onPageChange={handlePageChangeFromUI}
        />
      )}
    </div>
  );
}
