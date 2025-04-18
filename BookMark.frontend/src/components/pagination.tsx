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
    <nav className={`mt-8 text-center font-serif ${className}`}>
      <div className="inline-flex flex-wrap items-center justify-center gap-2 text-base sm:text-lg text-gray-700">
        {currentPage > 1 && (
          <span
            onClick={() => onPageChange(currentPage - 1)}
            className="cursor-pointer text-gray-600 hover:text-black hover:underline transition"
          >
            ← Back
          </span>
        )}

        {getRange().map((page, i) =>
          typeof page === "string" ? (
            <span key={i} className="text-gray-400 select-none">
              {page}
            </span>
          ) : (
            <span
              key={i}
              onClick={() => onPageChange(page)}
              className={`cursor-pointer px-1 ${
                page === currentPage
                  ? "text-black underline decoration-[2px] underline-offset-4"
                  : "text-gray-600 hover:text-black hover:underline transition"
              }`}
            >
              {page}
            </span>
          )
        )}

        {currentPage < totalPages && (
          <span
            onClick={() => onPageChange(currentPage + 1)}
            className="cursor-pointer text-gray-600 hover:text-black hover:underline transition"
          >
            Next →
          </span>
        )}
      </div>
    </nav>
  );
};
