import { BookReview } from "@/lib/types/book";
import { BookReviewCard } from "./book-review-card";

interface CurrentUserBookReviewProps {
  review: BookReview;
  onDelete: () => void;
}
export function CurrentUserBookReview({
  review,
  onDelete: handleDelete,
}: CurrentUserBookReviewProps) {
  return (
    <div
      data-testid="current-user-book-review"
      className="border-2 border-accent p-0.5 rounded-lg bg-muted"
    >
      <h5 className="font-semibold font-mono pl-0.5 cursor-default text-center">
        - YOUR REVIEW -
      </h5>
      <BookReviewCard
        rating={review.rating}
        content={review.content}
        user={review.user}
        postedOn={new Date(review.createdAt)}
      />
      <div className="flex justify-end pr-5">
        <span
          data-testid="delete-review"
          className="underline font-semibold cursor-pointer font-mono hover:text-popover select-none"
          onClick={handleDelete}
        >
          Delete Review
        </span>
      </div>
    </div>
  );
}
