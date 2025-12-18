import { cn } from "@/lib/utils";
import { Fragment, useEffect, useRef, useState } from "react";

import { GenreLinkProps } from "@/lib/types/genre";

interface BookGenreSelectorProps {
  genre: GenreLinkProps;
  allGenres: GenreLinkProps[];
  selectedGenres: GenreLinkProps[];
  onChange: (genre: GenreLinkProps) => void;
}
export function BookGenreSelector({
  genre,
  allGenres,
  selectedGenres,
  onChange,
}: BookGenreSelectorProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const availableGenres = allGenres.filter(
    (g) => g.id === genre.id || !selectedGenres.find((s) => s.id === g.id)
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setFocusedIndex(null);
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <span
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={dropdownOpen}
        aria-label={`Select genre`}
        onClick={() => {
          setDropdownOpen((open) => {
            const newOpen = !open;
            if (newOpen) {
              const selectedIndex = availableGenres.findIndex(
                (g) => g.id === genre.id
              );
              setFocusedIndex(selectedIndex !== -1 ? selectedIndex : 0);
            }
            return newOpen;
          });
        }}
        onKeyDown={(e) => {
          if (dropdownOpen && e.key === "ArrowDown") {
            e.preventDefault();
            setFocusedIndex((prev) =>
              prev === null || prev === availableGenres.length - 1
                ? 0
                : prev + 1
            );
          } else if (dropdownOpen && e.key === "ArrowUp") {
            e.preventDefault();
            setFocusedIndex((prev) =>
              prev === null || prev === 0
                ? availableGenres.length - 1
                : prev - 1
            );
          } else if (dropdownOpen && e.key === "Escape") {
            setDropdownOpen(false);
          } else if (
            dropdownOpen &&
            e.key === "Enter" &&
            focusedIndex !== null
          ) {
            e.preventDefault();
            onChange(availableGenres[focusedIndex]);
            setFocusedIndex(null);
            setDropdownOpen(false);
          }
        }}
        style={{ outline: "none", boxShadow: "none", border: "none" }}
        className="cursor-pointer rounded-full px-3 py-[7px] text-xs tracking-wide bg-accent text-background font-bold font-[Helvetica] hover:text-popover select-none"
      >
        {genre.name || "Select genre"} ▼
      </span>

      {dropdownOpen && (
        <ul className="z-20 absolute overflow-auto rounded-lg bg-accent border-accent border-2 right-0 font-[Helvetica] font-medium mt-1.5">
          {availableGenres.map((g, index) => {
            const isCurrentSelected = genre.id === g.id;

            return (
              <Fragment key={g.id}>
                <li
                  role="option"
                  className={cn(
                    "cursor-pointer select-none px-4 border-4 box-border",
                    "text-muted",
                    isCurrentSelected && "font-bold",
                    focusedIndex === index
                      ? "bg-accent border-popover text-popover"
                      : "border-transparent"
                  )}
                  onMouseEnter={() => setFocusedIndex(index)}
                  onClick={() => {
                    if (dropdownOpen) {
                      onChange(g);
                      setFocusedIndex(null);
                      setDropdownOpen(false);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span>{g.name}</span>
                    {genre.id === g.id && (
                      <span className="ml-2 text-popover">◀</span>
                    )}
                  </div>
                </li>

                {/* Separator */}
                {index < availableGenres.length - 1 && (
                  <hr className="border-t border-muted/40" />
                )}
              </Fragment>
            );
          })}
        </ul>
      )}
    </div>
  );
}
