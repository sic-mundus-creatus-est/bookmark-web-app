import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getConstrainedAuthors } from "@/lib/services/api-calls/authorService";
import { createBook } from "@/lib/services/api-calls/bookService";
import { getAllGenres } from "@/lib/services/api-calls/genreService";
import { AuthorWithNameAndRole } from "@/lib/types/author";
import { Genre } from "@/lib/types/genre";
import { ImageUp, Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const AUTHOR_ROLES = [
  { id: 0, name: "Author" },
  { id: 1, name: "Writer" },
  { id: 2, name: "Penciler" },
  { id: 3, name: "Inker" },
  { id: 4, name: "Colorist" },
];

export function AddBookPage() {
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [title, setTitle] = useState<string>("");
  const [newAuthorName, setNewAuthorName] = useState("");
  const [authors, setAuthors] = useState<AuthorWithNameAndRole[]>([]);

  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [chosenGenres, setChosenGenres] = useState<Genre[]>([]);
  const currentYear = new Date().getFullYear();
  const [publicationYear, setPublicationYear] = useState<number>(currentYear);
  const [pageCount, setPageCount] = useState<number>(0);
  const [originalLanguage, setOriginalLanguage] = useState<string>("");

  const [description, setDescription] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresResponse = await getAllGenres();
        console.log(genresResponse);

        if (Array.isArray(genresResponse) && genresResponse.length > 0) {
          setAllGenres(genresResponse);
          const firstGenre = genresResponse[0];
          setChosenGenres([{ id: firstGenre.id, name: firstGenre.name }]);
        }
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      }
    };

    fetchGenres();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => {
      // to avoid memory leaks
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleResizeableTextArea(
    e: React.ChangeEvent<HTMLTextAreaElement>,
    setValue: React.Dispatch<React.SetStateAction<string>>
  ) {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
    setValue(textarea.value);
  }

  const handleAuthorRoleChange = (index: number, roleId: number) => {
    const newAuthors = [...authors];
    newAuthors[index].roleId = roleId;
    setAuthors(newAuthors);
  };

  function handleSelectAuthor(author: AuthorWithNameAndRole) {
    if (!author.name.trim()) return;

    if (author.id) {
      if (authors.some((a) => a.id === author.id)) return;
    } else {
      if (
        authors.some((a) => a.name.toLowerCase() === author.name.toLowerCase())
      )
        return;
    }

    setAuthors((prev) => [
      ...prev,
      { id: author.id, name: author.name, roleId: 0 },
    ]);
    setNewAuthorName("");
  }

  const handleRemoveAuthor = (index: number) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const handleAddGenre = () => {
    const selectedIds = chosenGenres.map((g) => g.id);
    const firstUnselected: Genre = allGenres.find(
      (g) => !selectedIds.includes(g.id)
    )!;

    if (firstUnselected) {
      const minimalGenre = {
        id: firstUnselected.id,
        name: firstUnselected.name,
      };
      setChosenGenres([...chosenGenres, minimalGenre]);
    }
  };

  function handleGenreChange(index: number, newGenre: Genre) {
    const minimalGenre = {
      id: newGenre.id,
      name: newGenre.name,
    };
    setChosenGenres((prev) => {
      const updated = [...prev];
      updated[index] = minimalGenre;
      return updated;
    });
  }

  const handleRemoveGenre = (index: number) => {
    if (chosenGenres.length > 1)
      setChosenGenres(chosenGenres.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    console.log({
      coverImageFile,
      title,
      authors,
      genres: chosenGenres,
      publicationYear,
      pageCount,
      originalLanguage,
      description,
    });
    try {
      const authorsWithRoles = authors.map((author) => ({
        authorId: author.id,
        roleId: author.roleId,
      }));

      const genreIds = chosenGenres.map((g) => g.id);

      const result = await createBook({
        title,
        authorsWithRoles,
        genreIds,
        originalLanguage,
        pageCount,
        publicationYear,
        description,
        coverImageFile: coverImageFile ?? undefined,
      });

      if (result?.id) {
        navigate(`/book/${result.id}`);
      }
    } catch (err) {
      console.error("Create book failed:", err);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-10 lg:px-14 xl:px-24 flex-grow">
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-[1fr_2fr] gap-5 items-start p-4">
        {/* Cover */}
        <label htmlFor="cover-upload" className="cursor-pointer block w-full">
          <input
            id="cover-upload"
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Card className="shadow-md rounded-b-lg w-full mx-auto bg-accent rounded-t-lg">
            <CardContent
              className="p-0 bg-background rounded-t-lg"
              style={{ aspectRatio: "2 / 3" }}
            >
              {coverImageFile ? (
                <div className="relative w-full h-full">
                  <img
                    src={URL.createObjectURL(coverImageFile)}
                    alt="Cover Preview"
                    className="w-full h-full rounded-t-lg border-t-2 border-x-2 border-accent bg-accent/95"
                  />

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCoverImageFile(null);
                    }}
                    type="button"
                    aria-label="Remove cover image"
                    className="absolute top-1 right-1 bg-accent text-muted hover:text-red-500 rounded-full p-1  m-1 shadow-md border-popover border-2"
                  >
                    <X size={17} strokeWidth={3} />
                  </button>
                </div>
              ) : (
                <img
                  src="/placeholder-image-vertical.png"
                  className="w-full h-full rounded-t-lg border-t-2 border-x-2 border-accent bg-accent/95"
                  alt="Placeholder"
                />
              )}
            </CardContent>
            <CardFooter className="pb-2 flex flex-col px-4 pt-1">
              <div className="flex justify-center mx-10">
                <div className="flex flex-col">
                  <div className="flex items-center gap-5">
                    <UploadCoverDisplayText>Upload</UploadCoverDisplayText>
                    <div
                      className={`text-4xl text-popover inline-flex items-center justify-center w-[calc(3ch+0.5rem)]`}
                    >
                      <ImageUp size={28} />
                    </div>
                  </div>

                  <div className="pl-2 -mt-2">
                    <span className="text-xs font-mono text-background">
                      .jpg, .jpeg, .png
                    </span>
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </label>

        {/* Book Info */}
        <div className="flex flex-col gap-5">
          <div>
            <textarea
              value={title}
              onChange={(e) => handleResizeableTextArea(e, setTitle)}
              placeholder="Title"
              rows={1}
              style={{ overflow: "hidden" }}
              spellCheck={false}
              className="pb-2 resize-none w-full text-2xl sm:text-2xl md:text-4xl lg:text-4xl xl:text-4xl font-[Verdana] font-bold text-accent leading-tight bg-transparent focus:outline-none"
            />

            <div
              className="text-lg font-serif text-accent px-4 pt-2"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.047), rgba(0,0,0,0.0))",
              }}
            >
              <span className="italic">by </span>
              {authors.map((author, i) => (
                <div key={i} className="inline-flex items-center gap-2 mr-3">
                  <div className="inline-flex gap-1">
                    <span className="text-accent">{author.name}</span>
                    <BookAuthorRoleSelector
                      author={author}
                      onChange={(newRoleId) =>
                        handleAuthorRoleChange(i, newRoleId)
                      }
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveAuthor(i)}
                    className="text-muted hover:text-red-500 font-extrabold focus:outline-none bg-accent rounded-full -ml-1"
                    aria-label={`Remove author ${author.name}`}
                    title="Remove author"
                    type="button"
                  >
                    <X strokeWidth={5} size={22} className="p-1" />
                  </button>
                  {authors.length > 1 && i != authors.length - 1 && (
                    <span className="-ml-1 font-bold">,</span>
                  )}
                </div>
              ))}

              <div className="flex items-center mt-2">
                <div className="flex-grow">
                  <AuthorSearchInput
                    value={newAuthorName}
                    authors={authors}
                    onChange={setNewAuthorName}
                    onSelect={handleSelectAuthor}
                    placeholder="Start typing to find an author"
                    className="w-full bg-muted outline-none border-2 border-b-4 border-accent px-2 rounded"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-b-4 border-accent bg-muted px-5 py-6 space-y-6">
            {/* Genres */}
            <div className="flex flex-wrap items-start gap-3 text-sm font-[Verdana] pl-2">
              <div className="uppercase text-accent font-bold tracking-wider pt-1 whitespace-nowrap">
                Genres:
              </div>
              <div className="flex flex-wrap gap-1">
                {allGenres.map((genre, i) => (
                  <div key={i} className="inline-flex items-center gap-1">
                    <GenreSelector
                      genre={genre}
                      onChange={(newGenre) => handleGenreChange(i, newGenre)}
                      allGenres={allGenres}
                      selectedGenres={chosenGenres}
                    />

                    {chosenGenres.length > 1 && (
                      <button
                        onClick={() => handleRemoveGenre(i)}
                        className="text-popover hover:text-red-700 font-bold rounded focus:outline-none -ml-1"
                        aria-label={`Remove genre ${genre.name}`}
                        title="Remove genre"
                        type="button"
                      >
                        <X strokeWidth={4} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end w-full">
                <button
                  onClick={handleAddGenre}
                  className="text-background font-bold flex items-center justify-center font-[Verdana] text-sm p-1 bg-accent rounded-full hover:text-popover -mb-3 -mt-1"
                  aria-label="Add genre"
                  type="button"
                >
                  <Plus strokeWidth={4} size={15} />
                </button>
              </div>
            </div>

            {/* Book Metadata */}
            <div className="grid gap-y-3 text-sm font-[Verdana]">
              <div className="col-span-2 bg-background px-2 py-2 rounded">
                <div className="grid grid-cols-[auto_1fr] gap-x-4 items-center">
                  <div className="uppercase text-accent font-bold tracking-wider whitespace-nowrap">
                    Published in:
                  </div>
                  <select
                    value={publicationYear}
                    onChange={(e) => setPublicationYear(Number(e.target.value))}
                    className="bg-background text-accent px-2 py-1 rounded border-b-2 border-accent/50 focus:outline-none focus:border-accent cursor-pointer"
                    style={{ width: "fit-content" }}
                  >
                    {Array.from({ length: currentYear }, (_, i) => {
                      const year = currentYear - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-[auto_1fr] gap-x-4 items-center px-2">
                <div className="uppercase text-accent font-bold tracking-wider whitespace-nowrap">
                  Pages:
                </div>
                <div className="flex items-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={pageCount}
                    onChange={(e) => {
                      const num = parseInt(e.target.value) || 0;
                      setPageCount(Math.max(0, num));
                    }}
                    className="bg-transparent text-accent text-md focus:outline-none px-1 border-b-2 border-accent/50"
                    style={{ width: `${pageCount.toString().length + 1}ch` }}
                  />
                  <div className="flex flex-col">
                    <button
                      onClick={() => setPageCount((p) => p + 1)}
                      className="text-accent/70 hover:text-accent text-xs leading-none"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => setPageCount((p) => Math.max(0, p - 1))}
                      className="text-accent/70 hover:text-accent text-xs leading-none"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              </div>

              <div className="col-span-2 bg-background px-2 py-2 rounded">
                <div className="grid grid-cols-[auto_1fr] gap-x-4 items-center">
                  <div className="uppercase text-accent font-bold tracking-wider whitespace-nowrap">
                    Written in:
                  </div>
                  <input
                    type="text"
                    value={originalLanguage}
                    onChange={(e) => setOriginalLanguage(e.target.value)}
                    placeholder="Language"
                    className="px-1 text-md uppercase text-accent bg-transparent focus:outline-none border-b-2 border-accent/50 w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <textarea
            value={description}
            onChange={(e) => handleResizeableTextArea(e, setDescription)}
            placeholder="Description..."
            rows={1}
            style={{ overflow: "hidden" }}
            spellCheck={false}
            className="px-2 resize-none focus:outline-none border-b-2 rounded-lg bg-accent/10 border-accent text-lg leading-relaxed text-accent font-[Georgia] indent-4 text-balance placeholder:text-accent/70 whitespace-normal break-words w-full min-w-[2ch] empty:before:content-[attr(data-placeholder)] before:text-accent/50"
          />

          <div className="flex justify-end">
            <button
              onClick={handleCreate}
              className="flex items-center gap-1 bg-accent text-background font-bold px-3 py-2 rounded-lg transition border-b-4 border-popover hover:text-popover"
              type="button"
            >
              <Plus className="text-popover" strokeWidth={3} />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StarsWidthTextProps {
  children: React.ReactNode;
}
const UploadCoverDisplayText = ({ children }: StarsWidthTextProps) => {
  return (
    <div
      className={`inline-block w-[calc(5ch+0.5rem)] pl-4 text-3xl text-muted font-[Helvetica]`}
    >
      {children}
    </div>
  );
};

function BookAuthorRoleSelector({
  author,
  onChange,
}: {
  author: { id: string; name: string; roleId: number };
  onChange: (roleId: number) => void;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={dropdownOpen}
        aria-label={`Select role for author ${author.name}`}
        onClick={() => setDropdownOpen((open) => !open)}
        className="text-accent bg-transparent hover:text-popover focus:outline-none select-none"
      >
        ▼
      </button>
      {dropdownOpen && (
        <ul
          role="listbox"
          tabIndex={-1}
          className="z-20 absolute overflow-auto rounded-lg bg-muted border-accent border-2 border-b-4 right-0 font-[Helvetica] font-medium"
        >
          {AUTHOR_ROLES.map((role) => (
            <li
              key={role.id}
              role="option"
              tabIndex={0}
              aria-selected={author.roleId === role.id}
              className={`cursor-pointer px-3 hover:bg-accent hover:text-popover ${
                author.roleId === role.id
                  ? "bg-accent text-muted font-semibold border-4 border-popover"
                  : "text-accent"
              }`}
              onClick={() => {
                onChange(role.id);
                setDropdownOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(role.id);
                  setDropdownOpen(false);
                }
              }}
            >
              {role.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GenreSelector({
  genre,
  onChange,
  allGenres,
  selectedGenres,
}: {
  genre: { id: string; name: string };
  onChange: (genre: { id: string; name: string }) => void;
  allGenres: { id: string; name: string }[];
  selectedGenres: { id: string; name: string }[];
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
        onClick={() => setDropdownOpen((open) => !open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setDropdownOpen((open) => !open);
          }
        }}
        style={{ outline: "none", boxShadow: "none", border: "none" }}
        className="cursor-pointer rounded-full px-3 py-1.5 text-xs tracking-wide bg-accent text-background font-bold font-[Helvetica] hover:opacity-90"
      >
        {genre.name || "Select genre"} ▼
      </Badge>

      {dropdownOpen && (
        <ul
          role="listbox"
          tabIndex={-1}
          className="z-20 absolute overflow-auto rounded-lg bg-accent border-accent border-2 right-0 font-[Helvetica] font-medium"
        >
          {availableGenres.map((g) => (
            <li
              key={g.id}
              role="option"
              tabIndex={0}
              aria-selected={genre.id === g.id}
              className={`cursor-pointer px-3 hover:bg-accent hover:text-popover ${
                genre.id === g.id
                  ? "bg-accent text-muted font-semibold border-4 border-popover"
                  : "text-muted"
              }`}
              onClick={() => {
                onChange(g);
                setDropdownOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(g);
                  setDropdownOpen(false);
                }
              }}
            >
              {g.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface AuthorSearchInputProps {
  value: string;
  authors: AuthorWithNameAndRole[];
  onChange: (val: string) => void;
  onSelect: (author: AuthorWithNameAndRole) => void;
  placeholder?: string;
  className?: string;
}
function AuthorSearchInput({
  value,
  authors,
  onChange,
  onSelect,
  placeholder,
  className,
}: AuthorSearchInputProps) {
  const [suggestions, setSuggestions] = useState<AuthorWithNameAndRole[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // temporary FIFO cache...
  const cacheRef = useRef<Record<string, AuthorWithNameAndRole[]>>({});
  const cacheKeysRef = useRef<string[]>([]);

  useEffect(() => {
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    if (cacheRef.current[value]) {
      setSuggestions(cacheRef.current[value]);
      setShowSuggestions(true);
      return;
    }

    const timeoutId = setTimeout(() => {
      const fetchAuthors = async () => {
        try {
          const result: any = await getConstrainedAuthors({
            filters: { "Name~=": value },
            pageIndex: 1,
            pageSize: 5,
          });
          console.log(result);
          const items = result?.items ?? [];

          cacheRef.current[value] = items;
          cacheKeysRef.current.push(value);

          if (cacheKeysRef.current.length > 20) {
            const oldestKey = cacheKeysRef.current.shift()!;
            delete cacheRef.current[oldestKey];
          }

          setSuggestions(items);
          setShowSuggestions(true);
        } catch (error: any) {
          setSuggestions([]);
          console.error(
            `ERROR WHILE SEARCHING FOR AUTHORS:`,
            `\n----------------------------------`,
            `\n[${error.instance}]`,
            `\nQuery: Name~="${value}"`,
            `\nError: ${error.status}`,
            `\n----------------------------------`,
            `\nType: ${error.type}`,
            `\nTitle: ${error.title}`,
            `\nDetail: ${error.detail}`,
            `\nTrace ID: ${error.traceId}`
          );
        }
      };

      fetchAuthors();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        placeholder={placeholder}
        className={className}
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim()) {
            e.preventDefault();
            if (suggestions.length > 0) {
              onSelect(suggestions[0]);
            }
            setShowSuggestions(false);
          }
        }}
      />

      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 bg-accent-foreground text-muted border border-muted rounded shadow w-full overflow-y-auto">
          {suggestions
            .filter((s) => !authors.some((a) => a.id === s.id))
            .map((author, index) => (
              <li
                key={author.id}
                className={`px-3 py-1 hover:border-popover cursor-pointer text-md ${
                  index === 0
                    ? "bg-accent/90 border-2 border-b-4 border-popover"
                    : ""
                }`}
                onClick={() => {
                  onSelect(author);
                  setShowSuggestions(false);
                }}
              >
                {author.name}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
