import { UserLinkProps } from "@/lib/types/user";
import { CommonDescription } from "../common/common-description";
import { BookRatingStars } from "./book-rating-stars";
import { Link } from "react-router-dom";

interface BookReviewCardProps {
  user?: UserLinkProps;
  rating?: number;
  content?: string;
  postedOn?: Date;
}
export function BookReviewCard({
  user,
  rating = 4,
  content,
  postedOn = new Date(),
}: BookReviewCardProps) {
  return (
    <div className="flex flex-col w-full px-1 max-w-full overflow-hidden">
      <Link
        to={`/user/${user?.id}`}
        className="self-start truncate text-accent hover:text-popover cursor-pointer font-[Candara] font-bold text-lg -mb-2"
      >
        {user?.displayName ? user.displayName : `@${user?.username}`}
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-x-2 w-full">
        <span className="truncate italic pl-1.5 text-md font-sans font-semibold text-accent/70">
          posted on: {postedOn.toLocaleDateString("en-GB")}
        </span>
        <BookRatingStars value={rating} size={24} />
      </div>
      <CommonDescription placeholder="" value={content} />
    </div>
  );
}
