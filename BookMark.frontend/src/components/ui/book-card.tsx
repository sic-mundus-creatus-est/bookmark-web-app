import { Card, CardContent } from "@/components/ui/card";
import { FILE_FETCH_BASE_URL } from "@/lib/services/api-calls/bookService";
import { Book } from "@/lib/types/book";
import { RatingToStars } from "@/lib/utils/bookUtils";
import { Link } from "react-router-dom";

/**
 * A BookCard component displays a book's cover, title, author, and rating with a hover effect that reveals a truncated description.
 */
export function BookCard({ book }: { book: Book }) {
  return (
    <Link to={`/book/${book.id}`}>
      <Card className="rounded-lg flex flex-col relative bg-muted">
        <div
          className="relative group w-full overflow-hidden"
          style={{ aspectRatio: "2/3" }}
        >
          {/* BookCover */}
          <img
            src={
              book.coverImage
                ? `${FILE_FETCH_BASE_URL}${book.coverImage}`
                : "/cover_placeholder.jpg"
            }
            alt={`Cover of ${book.title}`}
            className="w-full h-full rounded-t-lg border-t-2 border-l-2 border-r-2 border-accent" // stretched
          />

          {/* Book description on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none 
              bg-gradient-to-b from-accent/20 via-accent/60 to-accent/70"
          />

          <div
            className="absolute bottom-0 w-full px-3 py-2 text-xs text-muted 
                     bg-gradient-to-t from-accent/80 to-transparent 
                     opacity-0 group-hover:opacity-100 
                     transition-opacity duration-300 overflow-hidden"
          >
            {book.description
              ? `${book.description.substring(0, 200)}${
                  book.description.length > 200 ? "..." : ""
                }`
              : "No description available."}
          </div>
        </div>

        {/* Book Details */}
        <CardContent className="p-2 flex-grow flex flex-col border-r-2 border-l-2 border-b-4 border-accent rounded-b-lg">
          {/* Title - exactly 2 lines */}
          <h3 className="font-bold font-[Helvetica] text-md leading-tight line-clamp-2 mb-1 h-[2.5rem] overflow-hidden text-accent hover:text-popover">
            {book.title}
          </h3>

          {/* Author */}
          <div className="text-xs font-[Verdana] text-accent line-clamp-1">
            <span className="italic font">by </span>
            {book.authors.map((a, i) => (
              <span key={a.id} className="font-semibold">
                {a.firstName} {a.lastName}
                {i < book.authors.length - 1 ? ", " : ""}
              </span>
            ))}
          </div>

          {/* Rating */}
          <div className="mt-auto">
            <div className="flex items-center -mt-1 space-x-1">
              <RatingToStars rating={book.rating!} />
              <span className="text-sm text-accent font-[Verdana]">
                {book.rating?.toFixed(1)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function BookCardPlaceholder() {
  return (
    <div className="aspect-[2/3] w-full max-w-xs">
      <div className="shadow bg-muted flex flex-col overflow-hidden animate-pulse rounded-lg">
        {/* Image Placeholder */}
        <div
          className="w-full bg-background"
          style={{ aspectRatio: "2 / 3" }}
        />

        {/* Content Placeholder */}
        <div className="p-2 flex flex-col flex-grow">
          <div className="h-5 bg-background rounded w-4/5 mb-1" />
          <div className="h-4 bg-background rounded w-2/5 mb-2" />

          <div className="h-4 bg-background rounded w-3/5 mb-2" />

          <div className="mt-auto flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="w-3 h-3 bg-background rounded-sm" />
              ))}
            </div>
            <div className="w-6 h-4 bg-background rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
