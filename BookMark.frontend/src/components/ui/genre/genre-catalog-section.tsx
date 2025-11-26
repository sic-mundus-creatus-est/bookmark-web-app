import { BookShowcase } from "@/components/layouts/book-showcase";
import { BookLinkProps } from "@/lib/types/book";
import { Link } from "react-router-dom";

interface GenreCatalogSectionProps {
  label: string;
  genreName: string;
  bookType: string;
  books?: BookLinkProps[];
}
export const GenreCatalogSection = ({
  label,
  genreName,
  bookType,
  books = [],
}: GenreCatalogSectionProps) => {
  return (
    <section className="flex justify-center mb-1">
      {books.length != 0 && (
        <div className="flex flex-col items-center gap-1 w-full">
          <Link
            to={`/all?genre=${encodeURIComponent(
              genreName
            )}&book-type=${encodeURIComponent(bookType)}`}
          >
            <h2 className="mt-2 text-2xl font-extrabold text-accent text-center hover:text-popover">
              {label}
            </h2>
            <div className="w-full rounded-b-lg border-b-4 border-popover mb-1" />
          </Link>

          <div className="flex-1 min-w-0 w-full">
            <BookShowcase books={books} />
          </div>
        </div>
      )}
    </section>
  );
};
