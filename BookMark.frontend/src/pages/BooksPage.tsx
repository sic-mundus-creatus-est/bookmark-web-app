import { useEffect } from "react";
import { useMatches, useSearchParams } from "react-router-dom";

import { Pagination } from "@/components/pagination";
import { BookCard } from "@/components/ui/book/book-card";
import { useLoading } from "@/lib/contexts/useLoading";
import { BookLinkProps } from "@/lib/types/book";
import { useConstrainedBooks } from "@/lib/services/api-calls/hooks/useBookApi";

const PAGE_SIZE = 12;

type FilterKey =
  | "Title~="
  | "Description~="
  | "Authors.Author.Name~="
  | "BookType.Name=="
  | "Genres.Genre.Name=="
  | "Authors.Author.Name==";

type Filters = Partial<Record<FilterKey, string>>;

export function BooksPage() {
  //------------------------------------------------------------------------------
  const { showLoadingScreen, hideLoadingScreen } = useLoading();
  //------------------------------------------------------------------------------
  const matches = useMatches();
  const bookTypeNameMatch = (matches[1].handle as string) ?? undefined;
  //------------------------------------------------------------------------------
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = isNaN(pageParam) ? 1 : Math.max(1, pageParam);
  //------------------------------------------------------------------------------
  const searchTermParam = searchParams.get("search-term") || undefined;
  const genreNameParam = searchParams.get("genre") || undefined;
  const bookTypeNameParam = searchParams.get("book-type") || undefined;
  const authorNameParam = searchParams.get("author") || undefined;

  const filters: Filters = {};

  const add = (key: FilterKey, value: string | undefined) => {
    if (value !== undefined) {
      filters[key] = value;
    }
  };

  if (searchTermParam !== undefined) {
    add("Title~=", searchTermParam);
    add("Description~=", searchTermParam);
    add("Authors.Author.Name~=", searchTermParam);
  }
  add("BookType.Name==", bookTypeNameMatch ?? bookTypeNameParam);
  add("Genres.Genre.Name==", genreNameParam);
  add("Authors.Author.Name==", authorNameParam);
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
    <div className={`w-full pb-2 ${!searchTermParam && "pt-2"}`}>
      {searchTermParam && (
        <h4 className="text-center text-lg font-semibold font-[Helvetica] overflow-hidden line-clamp-2">
          {page?.items && page.items.length > 0 ? (
            <>
              Search results for{" "}
              <span className="italic font-extrabold text-popover text-xl">
                "{searchTermParam}"
              </span>
              :
            </>
          ) : (
            <>
              No results found for{" "}
              <span className="italic font-extrabold text-popover text-xl">
                "{searchTermParam}"
              </span>
              .
            </>
          )}
        </h4>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-4 mb-2">
        {page?.items?.map((book: BookLinkProps) => (
          <div
            key={book.id}
            data-testid="book-card"
            data-book-type={book.bookType.name}
            className="aspect-[2/3] w-full max-w-xs"
          >
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
