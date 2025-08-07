import { Card, CardContent } from "@/components/ui/card";
import { API_FILE_RESOURCES_URL } from "@/lib/services/api-calls/api";
import { Book } from "@/lib/types/book";
import { Link, useNavigate } from "react-router-dom";
import { BookRatingStars } from "./book-rating-stars";

/**
 * A BookCard component displays a book's cover, title, author, and rating with a hover effect that reveals a truncated description.
 */
export function BookCard({ book }: { book: Book }) {
  const navigate = useNavigate();
  return (
    <Link to={`/book/${book.id}`}>
      <Card className="rounded-lg flex flex-col relative">
        <div
          className="relative group w-full overflow-hidden"
          style={{ aspectRatio: "2/3" }}
        >
          {/* BookCover */}
          <img
            src={
              book.coverImage
                ? `${API_FILE_RESOURCES_URL}${book.coverImage}`
                : "/cover_placeholder.jpg"
            }
            alt={`Cover of ${book.title}`}
            className="w-full h-full rounded-t-lg border-t-2 border-l-2 border-r-2 border-accent bg-accent"
          />

          {/* Book description on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg duration-300 pointer-events-none 
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
        <CardContent className="p-2 pb-0 flex-grow flex flex-col border-r-2 border-l-2 border-b-4 border-accent rounded-b-lg  bg-muted">
          {/* Title - exactly 2 lines */}
          <h3 className="font-bold font-[Helvetica] text-lg leading-tight line-clamp-2 mb-1 h-[2.5rem] overflow-hidden text-accent hover:text-popover">
            {book.title}
          </h3>

          {/* Author */}
          <div className="text-sfont-[Verdana] text-accent line-clamp-1">
            <span className="italic">by </span>
            {book.authors.map((a, i) => (
              <button
                key={a.id}
                className="btn btn-link px-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/author/${a.id}`);
                }}
              >
                <span key={a.id} className="font-semibold hover:text-popover">
                  {a.name}
                  {i < book.authors.length - 1 ? ", " : ""}
                </span>
              </button>
            ))}
          </div>

          {/* Rating */}
          <div className="mt-auto">
            <div className="flex items-center -mt-1 space-x-1">
              <BookRatingStars rating={book.rating ?? 3.4} />
              <span className="text-sm text-accent font-[Verdana] font-semibold">
                {book.rating?.toFixed(1) ?? 3.4}
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
