import { Genre } from "@/lib/types/genre";
import { Fragment, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface BookGenreSelectorProps {
  genre: Genre;
  allGenres: Genre[];
  selectedGenres: Genre[];
  onChange: (genre: Genre) => void;
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
      <Badge
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
        className="cursor-pointer rounded-full px-3 py-1.5 text-xs tracking-wide bg-accent text-background font-bold font-[Helvetica] hover:opacity-90"
      >
        {genre.name || "Select genre"} ▼
      </Badge>

      {dropdownOpen && (
        <ul className="z-20 absolute overflow-auto rounded-lg bg-accent border-accent border-2 right-0 font-[Helvetica] font-medium">
          {availableGenres.map((g, index) => {
            const isCurrentSelected = genre.id === g.id;

            return (
              <Fragment key={g.id}>
                <li
                  role="option"
                  className={`cursor-pointer px-4 ${
                    isCurrentSelected ? "text-popover font-bold" : "text-muted"
                  }${
                    focusedIndex === index
                      ? "bg-accent text-muted font-semibold border-4 border-popover"
                      : ""
                  }`}
                  onMouseEnter={() => setFocusedIndex(index)}
                  onClick={() => {
                    if (dropdownOpen) {
                      onChange(g);
                      setFocusedIndex(null);
                      setDropdownOpen(false);
                    }
                  }}
                >
                  {g.name}
                </li>

                {/* Separator */}
                {index < availableGenres.length - 1 &&
                  focusedIndex !== index &&
                  focusedIndex !== index + 1 && (
                    <hr className="border-t border-muted/40 my-1" />
                  )}
              </Fragment>
            );
          })}
        </ul>
      )}
    </div>
  );
}
