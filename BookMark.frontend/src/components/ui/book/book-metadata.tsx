import { Book } from "@/lib/types/book";
import { GenreBadge } from "../genre/genre-badge";

interface BookMetadataProps {
  book?: Book;
}
export function BookMetadata({ book }: BookMetadataProps) {
  return (
    <div className="rounded-lg border-2 border-b-4 border-accent bg-muted px-2 sm:px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-start gap-3 text-sm font-[Verdana] pl-2">
        <div
          role="region"
          aria-label="Genres"
          className="flex flex-wrap items-center gap-2 gap-y-3.5"
        >
          <span className="uppercase text-accent font-bold tracking-wider pt-1 whitespace-nowrap">
            Genres:
          </span>
          {book?.genres!.map((bg) => (
            <GenreBadge key={bg.id} genreName={bg.name} genreId={bg.id} />
          ))}
        </div>
      </div>
      <div className="grid gap-y-3 text-sm font-[Verdana]">
        <div className="col-span-2 bg-background px-2 py-1 rounded">
          <div className="grid grid-cols-[auto_1fr] gap-x-4 items-center">
            <span className="uppercase text-accent font-bold tracking-wider whitespace-nowrap">
              Published in:
            </span>
            <div className="text-lg text-accent font-[Georgia]">
              {book?.publicationYear}.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-x-4 items-center px-2">
          <span className="uppercase text-accent font-bold tracking-wider whitespace-nowrap">
            Pages:
          </span>
          <div className="text-lg text-accent font-[Georgia]">
            {book?.pageCount}
          </div>
        </div>

        <div className="col-span-2 bg-background px-2 py-2 rounded">
          <div className="grid grid-cols-[auto_1fr] gap-x-4 items-center">
            <span className="uppercase text-accent font-bold tracking-wider whitespace-nowrap">
              Written in:
            </span>
            <span className="uppercase text-accent overflow-hidden font-sans font-semibold">
              {book?.originalLanguage}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
