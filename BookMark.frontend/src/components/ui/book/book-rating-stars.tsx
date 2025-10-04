import { Sparkles, Star } from "lucide-react";

interface RatingStarsProps {
  value?: number;
  size?: number;
  showEmptyStars?: boolean;
}

export const BookRatingStars = ({
  value = 0,
  size = 16,
  showEmptyStars = false,
}: RatingStarsProps) => {
  const safeValue = Math.max(0, Math.min(5, value));
  const fullStars = Math.floor(safeValue);
  const fraction = safeValue - fullStars;
  const emptyStars = 5 - fullStars - (fraction > 0 ? 1 : 0);

  return (
    <div className="flex items-center">
      {/* Full stars */}
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-star-${i}`}
          size={size}
          className="text-popover"
          fill="currentColor"
        />
      ))}

      {/* Fractions (+) */}
      {fraction > 0 && (
        <Sparkles
          key={`fraction-star`}
          size={size}
          className="text-popover"
          fill="currentColor"
        />
      )}

      {/* Empty stars */}
      {showEmptyStars &&
        [...Array(emptyStars)].map((_, i) => (
          <Star
            key={`empty-star-${i}`}
            size={size}
            className="text-muted"
            fill="currentColor"
          />
        ))}
    </div>
  );
};
