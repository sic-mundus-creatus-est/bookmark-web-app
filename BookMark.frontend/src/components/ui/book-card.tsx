import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export interface Book {
  // TODO: all types should be moved to 'lib/types' folder
  id: string;
  title: string;
  author: string;
  coverImage: string;
  rating: number;
  ratingCount?: number;
  publishedYear?: number;
  genre?: string;
  desc?: string;
}

interface BookCardProps {
  book: Book;
}

/**
 * A BookCard component displays a book's cover, title, author, and rating with a hover effect that reveals a truncated description.
 */
export function BookCard({ book }: BookCardProps) {
  return (
    <Card className="rounded-b-2xl hover:shadow-xl transition-shadow flex flex-col relative">
      <div
        className="relative group w-full overflow-hidden bg-gray-50"
        style={{ aspectRatio: "2/3" }}
      >
        {/* BookCover */}
        <img
          src={book.coverImage}
          alt={`Cover of ${book.title}`}
          className="w-full h-full" // stretched
        />

        {/* Book description on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none 
              bg-gradient-to-b from-black/20 via-black/60 to-black/70"
        />

        <div
          className="absolute bottom-0 w-full px-3 py-2 text-xs text-white 
                     bg-gradient-to-t from-black/80 to-transparent 
                     opacity-0 group-hover:opacity-100 
                     transition-opacity duration-300 overflow-hidden"
        >
          {book.desc
            ? `${book.desc.substring(0, 200)}${
                book.desc.length > 200 ? "..." : ""
              }`
            : "No description available."}
        </div>
      </div>

      {/* Book Details */}
      <CardContent className="p-2 flex-grow flex flex-col">
        {/* Title - exactly 2 lines */}
        <h3 className="font-medium text-md leading-tight line-clamp-2 mb-1 h-[2.5rem] overflow-hidden">
          {book.title}
        </h3>

        <Separator className="my-1" />
        {/* Author */}
        <p className="text-sm text-gray-600 line-clamp-1">
          by <span className="font-bold">{book.author}</span>
        </p>

        {/* Rating */}
        <div className="mt-auto">
          <div className="flex items-center mt-1 space-x-1">
            <RatingStars rating={book.rating} />
            <span className="text-sm text-gray-600">
              {book.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const RatingStars = ({ rating }: { rating: number }) => {
  // TODO: probs move this to utils or smt
  const fullStars = Math.floor(rating);
  const fraction = rating - fullStars;
  const emptyStars = 5 - fullStars - (fraction > 0 ? 1 : 0);

  return (
    <div className="flex">
      {/* full stars */}
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-${i}`} className="text-md text-yellow-500">
          ★
        </span>
      ))}

      {/* plus sign for fractions */}
      {fraction > 0 && (
        <span className="text-2xl font-bold text-yellow-500">⁺</span>
      )}

      {/* empty stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-${i}`} className="text-md text-gray-300">
          ★
        </span>
      ))}
    </div>
  );
};

export function BookCardPlaceholder() {
  return (
    <div className="aspect-[2/3] w-full max-w-xs">
      <div className="rounded-b-2xl shadow bg-white flex flex-col overflow-hidden animate-pulse">
        {/* Image Placeholder */}
        <div className="w-full bg-gray-200" style={{ aspectRatio: "2 / 3" }} />

        {/* Content Placeholder */}
        <div className="p-2 flex flex-col flex-grow">
          <div className="h-5 bg-gray-200 rounded w-4/5 mb-1" />
          <div className="h-4 bg-gray-200 rounded w-2/5 mb-2" />

          <div className="h-[1px] bg-gray-200 my-2" />

          <div className="h-4 bg-gray-200 rounded w-3/5 mb-2" />

          <div className="mt-auto flex items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="w-3 h-3 bg-gray-200 rounded-sm" />
              ))}
            </div>
            <div className="w-6 h-4 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
