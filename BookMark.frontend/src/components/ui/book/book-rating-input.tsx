import { useState } from "react";
import { Star } from "lucide-react";

interface BookRatingInputProps {
  value?: number; // integer 0-5
  onChange?: (newValue: number) => void;
  size?: number;
}

export const BookRatingInput = ({
  value = 0,
  onChange,
  size = 24,
}: BookRatingInputProps) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const safeValue = Math.max(0, Math.min(5, value));
  const displayValue = hoverValue !== null ? hoverValue : safeValue;

  return (
    <div
      className="inline-flex flex-col"
      onMouseLeave={() => setHoverValue(null)}
    >
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isActive = starValue <= displayValue;

          return (
            <button
              key={starValue}
              type="button"
              onClick={() => onChange?.(starValue)}
              onMouseEnter={() => setHoverValue(starValue)}
              className="focus:outline-none"
            >
              <Star
                size={size}
                className={isActive ? "text-popover" : "text-accent"}
                fill={isActive ? "currentColor" : "transparent"}
              />
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onChange?.(0)}
          onMouseEnter={() => setHoverValue(null)}
          className="text-sm font-mono underline pr-1 hover:font-bold"
        >
          clear
        </button>
      </div>
    </div>
  );
};
