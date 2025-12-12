import { Book } from "@/lib/types/book";
import { Card, CardContent, CardFooter } from "../card";
import { BookRatingStars } from "./book-rating-stars";
import { API_FILE_RESOURCES_URL } from "@/lib/services/api-calls/api";

interface BookPageCoverCardProps {
  book?: Book;
}
export function BookPageCoverCard({ book }: BookPageCoverCardProps) {
  return (
    <Card className="rounded-b-lg w-full mx-auto bg-accent rounded-t-lg md:sticky md:top-36 lg:top-28 self-start">
      <CardContent
        className="p-0 bg-background rounded-t-lg"
        style={{ aspectRatio: "2 / 3" }}
      >
        <img
          src={
            book?.coverImageUrl
              ? `${API_FILE_RESOURCES_URL}${book.coverImageUrl}`
              : "/cover_placeholder.jpg"
          }
          alt={`Cover of ${book?.title}`}
          className="w-full h-full rounded-t-lg border-t-2 border-x-2 border-accent bg-accent/95"
        />
      </CardContent>
      <CardFooter className="pb-2 flex flex-col px-4">
        <div className="py-2">
          <span className="inline-flex gap-5">
            <BookRatingStars
              value={book?.averageRating}
              size={30}
              showEmptyStars
            />
            <span className="text-[32px] font-bold text-muted font-[Candara] leading-tight">
              {book?.averageRating != null && book?.averageRating != 0
                ? book.averageRating.toFixed(2)
                : "N/A"}
            </span>
          </span>

          <h5 className="pl-1 -mt-1 text-[14px] font-mono text-background text-start">
            {(book?.ratingsCount ?? 18587).toLocaleString("en-US")} ratings
          </h5>
        </div>
      </CardFooter>
    </Card>
  );
}
