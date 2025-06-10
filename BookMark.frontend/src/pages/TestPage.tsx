import { BookCatalog } from "@/components/layouts/book-catalog";
import { getConstrainedBooks } from "@/lib/services/api-calls/bookService";

const fetchBooksFromApi = async (pageIndex: number, pageSize: number) => {
  const response = await getConstrainedBooks({
    pageIndex: pageIndex,
    pageSize: pageSize,
  });

  return response;
};

export function TestPage() {
  return (
    <div className="px-7 pt-4 pb-2">
      <BookCatalog fetchBooks={fetchBooksFromApi} itemsPerPage={12} />
    </div>
  );
}
