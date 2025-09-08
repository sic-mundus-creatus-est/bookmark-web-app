import { BookShowcase } from "@/components/layouts/book-showcase";
import { Book } from "@/lib/types/book";

interface GenreCatalogSectionProps {
  name: string;
  type: string;
  books?: Book[];
  review: string;
  reverse?: boolean;
}
export const GenreCatalogSection = ({
  name,
  type,
  review,
  reverse = false,
  books = [],
}: GenreCatalogSectionProps) => {
  return (
    <section id={`genre-${name}-catalog`} className="flex justify-center">
      <div className="flex flex-col items-center gap-1 w-full">
        <div>
          <h2 className="mt-2 text-3xl font-extrabold text-accent text-center">
            {name} {type}
          </h2>
          <div className="w-full rounded-b-lg border-b-4 border-popover mb-1" />
        </div>
        <div
          className={`flex flex-col lg:flex-row gap-4 w-full mb-4 ${
            reverse ? "lg:flex-row-reverse" : ""
          }`}
        >
          <div className="flex-1 min-w-0">
            <BookShowcase books={books} />
          </div>

          <div className="w-full lg:w-[300px] h-full bg-muted rounded-lg p-4 border-accent border-2 border-b-8">
            <p className="text-center text-sm">{review}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
