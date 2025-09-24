import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { Author, AuthorLinkProps } from "@/lib/types/author";
import { useAuthorSuggestions } from "@/lib/services/api-calls/hooks/useAuthorApi";
import { useDebouncedValue } from "@/lib/utils";
import { UseQueryResult } from "@tanstack/react-query";
import { ApiError } from "@/lib/services/api-calls/api";

interface BookAuthorInputProps {
  placeholder?: string;
  entries?: AuthorLinkProps[];
  fetchSuggestions?: (
    searchTerm: string,
    skipIds: string[],
    count?: number
  ) => UseQueryResult<AuthorLinkProps[], ApiError>;
  onChange?: (entries: AuthorLinkProps[]) => void;
}
export function BookAuthorInput({
  placeholder = "Search authors...",
  entries = [],
  fetchSuggestions = useAuthorSuggestions,
  onChange,
}: BookAuthorInputProps) {
  //-----------------------------------------------------------------------------
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(searchTerm, 500);
  //-----------------------------------------------------------------------------
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedSuggestion, setFocusedSuggestion] = useState<number | null>(
    null
  );
  //-----------------------------------------------------------------------------
  const skipIds = useMemo(() => entries.map((a) => a.id), [entries]);
  const { data: suggestions = [] } = fetchSuggestions(
    debouncedSearchTerm,
    skipIds
  );

  const availableSuggestions =
    debouncedSearchTerm.trim() !== ""
      ? suggestions.filter((s) => !entries.some((a) => a.id === s.id))
      : [];
  //-----------------------------------------------------------------------------
  const containerRef = useRef<HTMLDivElement>(null);
  //-----------------------------------------------------------------------------

  //-----------------------------------------------------------------------------
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setShowSuggestions(false);
      setFocusedSuggestion(null);
    } else {
      setShowSuggestions(true);
      setFocusedSuggestion(0);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setFocusedSuggestion(null);
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);
  //-----------------------------------------------------------------------------

  //===========================================================
  const handleSelectAuthor = (selectedAuthor: Author) => {
    const bookAuthor: AuthorLinkProps = {
      id: selectedAuthor.id,
      name: selectedAuthor.name,
    };

    const updatedAuthors = [...entries, bookAuthor];

    onChange?.(updatedAuthors);

    setSearchTerm("");
  }; //===========================================================

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-muted outline-none border-2 border-b-4 border-accent px-2 rounded-lg focus-within:border-popover caret-popover"
        onKeyDown={(e) => {
          if (showSuggestions && e.key === "ArrowDown") {
            e.preventDefault();
            setFocusedSuggestion((prev) =>
              prev === null || prev === availableSuggestions.length - 1
                ? 0
                : prev + 1
            );
          } else if (showSuggestions && e.key === "ArrowUp") {
            e.preventDefault();
            setFocusedSuggestion((prev) =>
              prev === null || prev === 0
                ? availableSuggestions.length - 1
                : prev - 1
            );
          } else if (showSuggestions && e.key === "Enter") {
            e.preventDefault();
            const selected =
              focusedSuggestion! >= 0
                ? availableSuggestions[focusedSuggestion!]
                : availableSuggestions[0];

            if (selected) {
              handleSelectAuthor(selected);
            }
          } else if (showSuggestions && e.key === "Escape") {
            setSearchTerm("");
          }
        }}
      />

      {showSuggestions && availableSuggestions.length > 0 && (
        <ul className="absolute z-20 bg-accent-foreground text-muted rounded-lg shadow w-full overflow-y-auto max-h-60">
          {availableSuggestions.map((author, index) => (
            <Fragment key={author.id}>
              <li
                className={`px-3 py-1 cursor-pointer text-md ${
                  index === focusedSuggestion
                    ? "bg-accent/90 border-2 border-b-4 border-popover rounded-lg"
                    : ""
                }`}
                onMouseEnter={() => setFocusedSuggestion(index)}
                onClick={() => handleSelectAuthor(author)}
              >
                {author.name}
              </li>
              {index < availableSuggestions.length - 1 &&
                index !== focusedSuggestion &&
                index + 1 !== focusedSuggestion && (
                  <hr className="border-t border-muted/40" />
                )}
            </Fragment>
          ))}
        </ul>
      )}
    </div>
  );
}
