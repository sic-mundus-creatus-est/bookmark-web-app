import React, { useEffect, useState } from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

/**
 * Simple pagination.
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  const [windowWidth, setWindowWidth] = useState(1000);

  useEffect(() => {
    const update = () => setWindowWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const getRange = (): (number | string)[] => {
    const maxRange = windowWidth < 480 ? 1 : windowWidth < 768 ? 3 : 5;
    const pages: (number | string)[] = [];

    if (totalPages <= maxRange + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const left = Math.max(2, currentPage - Math.floor(maxRange / 2));
      const right = Math.min(
        totalPages - 1,
        currentPage + Math.floor(maxRange / 2)
      );

      pages.push(1);

      if (left > 2) pages.push("↝");

      for (let i = left; i <= right; i++) pages.push(i);

      if (right < totalPages - 1) pages.push("↝");

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav className={`text-center font-serif ${className}`}>
      <div className="inline-flex flex-wrap items-center justify-center gap-2 text-xl sm:text-lg">
        {currentPage > 1 && totalPages > 1 && (
          <span
            data-testid="pagination-back"
            onClick={() => onPageChange(currentPage - 1)}
            className="cursor-pointer text-accent hover:text-popover hover:underline underline-offset-4 decoration-[2px] transition"
          >
            ← Back
          </span>
        )}

        {getRange().map((page, i) =>
          typeof page === "string" ? (
            <span key={i} className="text-accent select-none">
              {page}
            </span>
          ) : (
            <span
              key={i}
              onClick={() => onPageChange(page)}
              className={`cursor-pointer px-1 ${
                page === currentPage
                  ? "text-popover underline decoration-[2px] underline-offset-4"
                  : "text-accent hover:text-popover hover:underline underline-offset-4 decoration-[2px] transition"
              }`}
            >
              {page}
            </span>
          )
        )}

        {currentPage < totalPages && (
          <span
            data-testid="pagination-next"
            onClick={() => onPageChange(currentPage + 1)}
            className="cursor-pointer text-accent hover:text-popover hover:underline underline-offset-4 decoration-[2px] transition"
          >
            Next →
          </span>
        )}
      </div>
    </nav>
  );
};
