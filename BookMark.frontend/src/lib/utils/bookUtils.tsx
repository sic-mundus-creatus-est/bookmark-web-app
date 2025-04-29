interface RatingToStarsProps {
  rating: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
}

export const RatingToStars = ({ rating, size = "md" }: RatingToStarsProps) => {
  const fullStars = Math.floor(rating);
  const fraction = rating - fullStars;
  const emptyStars = 5 - fullStars - (fraction > 0 ? 1 : 0);

  const sizeClass = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
  }[size];

  const fractionSizeClass = {
    xs: "text-base",
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
    "2xl": "text-4xl",
    "3xl": "text-4xl",
  }[size];

  return (
    <div className="flex items-center">
      {/* Full stars */}
      {[...Array(fullStars)].map((_, i) => (
        <span key={`full-star-${i}`} className={`${sizeClass} text-yellow-300`}>
          ★
        </span>
      ))}

      {/* Fractions */}
      {fraction > 0 && (
        <span
          key="fraction-plus"
          className={`${fractionSizeClass} font-bold text-yellow-300 pt-1`}
        >
          ⁺
        </span>
      )}

      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <span key={`empty-star-${i}`} className={`${sizeClass} text-gray-300`}>
          ★
        </span>
      ))}
    </div>
  );
};
