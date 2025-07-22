interface RatingStarsProps {
  rating: number;
  starSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  showEmptyStars?: boolean;
}

export const BookRatingStars = ({
  rating,
  starSize = "lg",
  showEmptyStars = false,
}: RatingStarsProps) => {
  const fullStars = Math.floor(rating);
  const fraction = rating - fullStars;
  const emptyStars = 5 - fullStars - (fraction > 0 ? 1 : 0);

  const starTextSize = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
  }[starSize];

  const fractionTextSize = {
    xs: "text-base",
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
    "2xl": "text-4xl",
    "3xl": "text-4xl",
  }[starSize];

  return (
    <div className="flex items-center">
      {/* Full stars */}
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-star-${i}`} className={`${starTextSize} text-popover`}>
          ★
        </span>
      ))}

      {/* Fractions (+) */}
      {fraction > 0 && (
        <span
          key="fraction-plus"
          className={`${fractionTextSize} font-bold text-popover pt-1`}
        >
          ⁺
        </span>
      )}

      {/* Empty stars */}
      {showEmptyStars &&
        [...Array(emptyStars)].map((_, i) => (
          <span
            key={`empty-star-${i}`}
            className={`${starTextSize} text-muted`}
          >
            ★
          </span>
        ))}
    </div>
  );
};
