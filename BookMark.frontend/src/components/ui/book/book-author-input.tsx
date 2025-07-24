import { AuthorWithNameAndRole } from "@/lib/types/author";
import { Fragment, useEffect, useRef, useState } from "react";

interface BookAuthorInputProps {
  placeholder?: string;
  selectedAuthors: AuthorWithNameAndRole[];
  fetchAuthorSuggestions: (query: string) => Promise<AuthorWithNameAndRole[]>;
  onChange?: (authors: AuthorWithNameAndRole[]) => void;
}
export function BookAuthorInput({
  placeholder = "Search authors...",
  selectedAuthors,
  fetchAuthorSuggestions,
  onChange,
}: BookAuthorInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<AuthorWithNameAndRole[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedSuggestion, setFocusedSuggestion] = useState<number | null>(
    null
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef<Record<string, AuthorWithNameAndRole[]>>({});
  const cacheKeysRef = useRef<string[]>([]);

  const availableSuggestions = suggestions.filter(
    (s) => !selectedAuthors.some((a) => a.id === s.id)
  );

  useEffect(() => {
    if (inputValue.trim() === "") {
      setSuggestions([]);
      setFocusedSuggestion(null);
      return;
    }

    if (cacheRef.current[inputValue]) {
      setSuggestions(cacheRef.current[inputValue]);
      return;
    }

    const timeoutId = setTimeout(() => {
      const fetch = async () => {
        try {
          const items = await fetchAuthorSuggestions(inputValue);
          cacheRef.current[inputValue] = items;
          cacheKeysRef.current.push(inputValue);

          if (cacheKeysRef.current.length > 20) {
            const oldestKey = cacheKeysRef.current.shift()!;
            delete cacheRef.current[oldestKey];
          }

          setSuggestions(items);
          setFocusedSuggestion(0);
        } catch (error: any) {
          setShowSuggestions(false);
          setFocusedSuggestion(null);
          setSuggestions([]);
          console.error(
            `ERROR WHILE SEARCHING FOR AUTHORS:`,
            `\n----------------------------------`,
            `\n[${error.instance}]`,
            `\nError: ${error.status}`,
            `\n----------------------------------`,
            `\nType: ${error.type}`,
            `\nTitle: ${error.title}`,
            `\nDetail: ${error.detail}`,
            `\nTrace ID: ${error.traceId}`
          );
        }
      };

      fetch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchAuthorSuggestions, inputValue]);

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

  const handleSelectAuthor = (author: AuthorWithNameAndRole) => {
    author.roleId = 0;
    const updatedAuthors = [...selectedAuthors, author];
    onChange?.(updatedAuthors);
    setInputValue("");
    setShowSuggestions(false);
    setFocusedSuggestion(null);
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setFocusedSuggestion(0);
          setShowSuggestions(true);
        }}
        placeholder={placeholder}
        className="w-full bg-muted outline-none border-2 border-b-4 border-accent px-2 rounded-lg"
        onKeyDown={(e) => {
          if (showSuggestions && e.key === "ArrowDown") {
            e.preventDefault();
            setShowSuggestions(true);
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
          } else if (
            showSuggestions &&
            e.key === "Enter" &&
            inputValue.trim()
          ) {
            e.preventDefault();
            const selected =
              focusedSuggestion! >= 0
                ? availableSuggestions[focusedSuggestion!]
                : availableSuggestions[0];

            if (selected) {
              handleSelectAuthor(selected);
            }
          } else if (showSuggestions && e.key === "Escape") {
            setShowSuggestions(false);
            setFocusedSuggestion(null);
          }
        }}
      />

      {showSuggestions && availableSuggestions.length > 0 && (
        <ul className="absolute z-50 bg-accent-foreground text-muted rounded-lg shadow w-full overflow-y-auto max-h-60">
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
