import { Card, CardContent } from "@/components/ui/card";
import { API_FILE_RESOURCES_URL } from "@/lib/services/api-calls/api";
import { BookLinkProps } from "@/lib/types/book";
import { Link, useNavigate } from "react-router-dom";
import { BookRatingStars } from "./book-rating-stars";

export function BookCard({ book }: { book: BookLinkProps }) {
  const navigate = useNavigate();
  return (
    <Link to={`/book/${book.id}`} className="block w-full">
      <Card className="bg-accent rounded-lg flex flex-col relative border-2 border-b-4 border-accent hover:border-popover">
        {/* BookCover */}
        <img
          src={
            book.coverImageUrl
              ? `${API_FILE_RESOURCES_URL}${book.coverImageUrl}`
              : "/cover_placeholder.jpg"
          }
          alt={`Cover of ${book.title}`}
          className="aspect-[2/3] w-full h-full rounded-t-md"
        />

        {/* Book Details */}
        <CardContent className="p-2 px-1 pb-0 flex-grow flex flex-col bg-muted rounded-b-sm">
          {/* Title - exactly 2 lines */}
          <h3 className="font-bold font-sans text-lg leading-tight line-clamp-2 mb-1 overflow-hidden text-accent min-h-12">
            {" "}
            {book.title}
          </h3>

          {/* Author */}
          <div className="text-accent whitespace-nowrap overflow-x-auto scrollbar-hide -mt-2">
            <span className="pl-0.5 italic text-sm">by </span>
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
                  {i < book.authors.length - 1 && <span>,&nbsp;</span>}
                </span>
              </button>
            ))}
          </div>

          {/* Rating */}
          <div className="flex -mt-1 space-x-1 px-1">
            <BookRatingStars value={book.rating ?? 4.7} />
            <span className="text-[18px] tracking-tighter text-accent font-semibold font-mono leading-tight">
              {(4.7).toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
