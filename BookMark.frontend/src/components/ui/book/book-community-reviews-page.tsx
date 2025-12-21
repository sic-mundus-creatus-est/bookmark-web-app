import { BookReview } from "@/lib/types/book";
import { Page } from "@/lib/types/common";
import { BookReviewCard } from "./book-review-card";
import { Pagination } from "@/components/pagination";

interface BookCommunityReviewsPageProps {
  reviews?: Page<BookReview>;
  currentPage: number;
  onPageChange: (page: number) => void;
}
export function BookCommunityReviewsPage({
  reviews,
  currentPage,
  onPageChange,
}: BookCommunityReviewsPageProps) {
  return (
    <div data-testid="book-community-reviews" className="flex flex-col gap-4">
      <h4 className="pl-1 text-xl font-bold font-[Verdana] border-accent border-b-4 rounded-b-sm">
        Community Reviews
      </h4>
      {(reviews?.items?.length ?? 0) > 0 ? (
        reviews?.items?.map((review) => (
          <BookReviewCard
            key={`${review.user.id}-${review.bookId}`}
            rating={review.rating}
            content={review.content}
            user={review.user}
            postedOn={new Date(review.createdAt)}
          />
        ))
      ) : (
        <p className="text-end text-xl text-accent/75 italic">
          Be the first one to leave a review!
        </p>
      )}

      {reviews && (
        <Pagination
          currentPage={currentPage}
          totalPages={reviews.totalPages}
          onPageChange={(page) => {
            onPageChange(page);
          }}
        />
      )}
    </div>
  );
}
