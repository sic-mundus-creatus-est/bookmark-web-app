import { CommonDescription } from "../common/common-description";
import { BookRatingStars } from "./book-rating-stars";

interface BookReviewCardProps {
  rating?: number;
  content?: string;
  postedOn?: Date;
}
export function BookReviewCard({
  rating = 4,
  content,
  postedOn = new Date(),
}: BookReviewCardProps) {
  return (
    <div className="flex flex-col w-full px-1">
      <div className="flex flex-col">
        <h5 className="font-bold overflow-hidden text-lg">
          <span className="text-accent hover:text-popover text-nowrap overflow-hidden cursor-pointer">
            @john.doe
          </span>
          :
        </h5>
        <div className="flex flex-row justify-between -mt-1 mb-1">
          <span className="italic pl-3 -mt-0.5 text-md font-sans font-semibold text-accent/70">
            posted on: {postedOn.toLocaleDateString("en-GB")}
          </span>
          <BookRatingStars value={rating} size={24} />
        </div>
      </div>
      <CommonDescription placeholder="" value={content} />
    </div>
  );
}
