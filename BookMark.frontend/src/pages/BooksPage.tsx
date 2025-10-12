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
  const matches = useMatches();
  const bookTypeNameFromMatches = (matches[1].handle as string) ?? undefined;
  //------------------------------------------------------------------------------
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = isNaN(pageParam) ? 1 : Math.max(1, pageParam);
  //------------------------------------------------------------------------------
  const searchQuery = searchParams.get("searchTerm") || undefined;
  let filters = {};

  if (searchQuery != undefined) {
    filters = {
      ...filters,
      "Title~=": searchQuery,
      "Description~=": searchQuery,
      "Authors.Author.Name~=": searchQuery,
    };
  }

  if (bookTypeNameFromMatches != undefined) {
    filters = {
      ...filters,
      "BookType.Name==": bookTypeNameFromMatches,
    };
  }
  //------------------------------------------------------------------------------
  const genreName = searchParams.get("genre") || undefined;
  const bookTypeNameFromUrl = searchParams.get("bookType") || undefined;

  if (genreName && bookTypeNameFromUrl) {
    filters = {
      ...filters,
      "BookType.Name==": bookTypeNameFromUrl,
      "Genres.Genre.Name==": genreName,
    };
  }
  //------------------------------------------------------------------------------
  const {
    data: page,
    isFetching: fetching,
    error,
  } = useConstrainedBooks({
    pageIndex: currentPage,
    pageSize: PAGE_SIZE,
    filters: filters,
  });
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

      const newParams = new URLSearchParams(searchParams);
      newParams.set("page", validatedPage.toString());

      setSearchParams(newParams);
    }
  }; //==============================================================================

  if (error)
    return (
      <div className="text-center p-10 text-lg font-mono text-destructive">
        An error occurred.
      </div>
    );
  return (
    <div className={`w-full pb-2 ${!searchQuery && "pt-2"}`}>
      {searchQuery && (
        <h4 className="text-center text-lg font-semibold font-[Helvetica] overflow-hidden line-clamp-2">
          Search results for{" "}
          <span className="italic font-extrabold text-popover text-xl">
            "{searchQuery}"
          </span>
          :
        </h4>
      )}
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
