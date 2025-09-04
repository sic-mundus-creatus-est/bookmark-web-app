import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getBookById } from "@/lib/services/api-calls/bookApi";
import { useEffect, useState } from "react";
import { Book, EditedBook } from "@/lib/types/book";
import { API_FILE_RESOURCES_URL } from "@/lib/services/api-calls/api";
import { BookRatingStars } from "@/components/ui/book/book-rating-stars";
import { SquarePen, X } from "lucide-react";
import {
  BookCoverImageUpload,
  UploadLabel,
} from "@/components/ui/book/book-cover-image-upload";
import { CommonNameTitleInput } from "@/components/ui/common/common-name-title-input";
import { BookAuthorEntries } from "@/components/ui/book/book-author-entries";
import { BookAuthorInput } from "@/components/ui/book/book-author-input";
import { BookGenreEntries } from "@/components/ui/book/book-genre-entries";
import { getAllGenres } from "@/lib/services/api-calls/genreApi";
import { PublicationYearSelector } from "@/components/ui/book/book-publication-year-selector";
import { BookPageCountInput } from "@/components/ui/book/book-page-count-input";
import { BookLanguageInput } from "@/components/ui/book/book-language-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { validateAndUpdateBook } from "@/lib/services/bookService";

import { useForm } from "react-hook-form";
import { authorInputSuggestions } from "@/lib/services/authorService";
import { BookTypePicker } from "@/components/ui/book/book-type-selector";
import { CommonDescriptionInput } from "@/components/ui/common/common-description-input";

export function BookPage() {
  //------------------------------------------------------------------------------
  const { id } = useParams<{ id: string }>();
  //------------------------------------------------------------------------------

  //------------------------------------------------------------------------------
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);

  const [globalFormError, setGlobalFormError] = useState<string | null>(null);
  //------------------------------------------------------------------------------

  //------------------------------------------------------------------------------
  const [book, setBook] = useState<Book>();
  //------------------------------------------------------------------------------

  const {
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { dirtyFields },
  } = useForm<EditedBook>();

  useEffect(() => {
    if (book) {
      reset({
        metadata: {
          bookTypeId: book.bookType.id,
          title: book.title,
          originalLanguage: book.originalLanguage,
          publicationYear: book.publicationYear,
          pageCount: book.pageCount,
          description: book.description,
        },
        authors: book.authors,
        genres: book.genres,
        coverImageFile: undefined,
      });
    }
  }, [editMode, book, reset]);

  useEffect(() => {
    async function fetchBook() {
      try {
        setLoading(true);
        setError(false);

        const data = await getBookById(id!);
        setBook(data);
      } catch (e) {
        console.error("Error fetching book:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center p-10 text-lg font-mono text-muted-foreground">
        Loading book...
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="text-center p-10 text-lg font-mono text-destructive">
        Book not found.
      </div>
    );
  }

  const handleUpdateBook = async (data: EditedBook) => {
    if (!book) return;

    function getChangedValues<T extends object>(
      dirty: any,
      allValues: T
    ): Partial<T> {
      return Object.keys(dirty).reduce((acc, key) => {
        if (dirty[key] === true) {
          // Field is dirty -> take its current value
          (acc as any)[key] = (allValues as any)[key];
        } else if (typeof dirty[key] === "object" && dirty[key] !== null) {
          // Nested object -> recurse
          const nested = getChangedValues(dirty[key], (allValues as any)[key]);
          if (Object.keys(nested).length > 0) {
            (acc as any)[key] = nested;
          }
        }
        return acc;
      }, {} as Partial<T>);
    }

    const changedData = getChangedValues(dirtyFields, data);

    console.log(changedData);

    if (Object.keys(changedData).length <= 0)
      return setGlobalFormError("You haven’t made any changes.");

    const { success, error } = await validateAndUpdateBook(
      book.id,
      changedData
    );

    if (!success) return setGlobalFormError(error!);

    const updatedBook = await getBookById(id!);
    setBook(updatedBook);

    setEditMode(false);
  };

  return (
    <div className="flex-grow">
      <div className="flex justify-center md:justify-end mx-0 md:mx-2 mt-2 pt-2">
        <button
          title={editMode ? "Cancel Editing" : "Edit"}
          onClick={() => setEditMode((prev) => !prev)}
          className="text-accent hover:text-popover"
        >
          {editMode ? (
            <X size={24} strokeWidth={5} />
          ) : (
            <SquarePen size={24} strokeWidth={3} />
          )}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-[1fr_2fr] gap-5 items-start pt-2 pb-10">
        {/* Cover */}
        <Card className="shadow-md rounded-b-lg w-full mx-auto bg-accent rounded-t-lg">
          <CardContent
            className="p-0 bg-background rounded-t-lg"
            style={{ aspectRatio: "2 / 3" }}
          >
            {editMode ? (
              <BookCoverImageUpload
                value={
                  book.coverImageUrl
                    ? `${API_FILE_RESOURCES_URL}${book.coverImageUrl}`
                    : null
                }
                onChange={(coverImageFile) => {
                  setValue("coverImageFile", coverImageFile, {
                    shouldDirty: true,
                  });
                }}
              />
            ) : (
              <img
                src={
                  book.coverImageUrl
                    ? `${API_FILE_RESOURCES_URL}${book.coverImageUrl}`
                    : "/cover_placeholder.jpg"
                }
                alt={`Cover of ${book.title}`}
                className="w-full h-full rounded-t-lg border-t-2 border-x-2 border-accent bg-accent/95"
              />
            )}
          </CardContent>
          <CardFooter className="pb-2 flex flex-col px-4">
            {editMode ? (
              <UploadLabel />
            ) : (
              <div className="flex justify-center mx-10">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-5">
                    <BookRatingStars
                      rating={3.4}
                      starSize="3xl"
                      showEmptyStars
                    />
                    <span className="text-3xl font-medium text-muted">
                      {3.4}
                    </span>
                  </div>

                  <div className="pl-1 -mt-3">
                    <span className="text-xs font-mono text-background">
                      18587 ratings
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardFooter>
        </Card>

        {/* Book Info */}
        <div className="flex flex-col gap-5 min-w-0">
          <div className="w-full">
            {editMode ? (
              <>
                <CommonNameTitleInput
                  value={watch("metadata.title")}
                  onChange={(newTitle) => {
                    setValue("metadata.title", newTitle, { shouldDirty: true });
                  }}
                />
                <BookTypePicker
                  value={watch("metadata.bookTypeId")}
                  onChange={(newBookType) => {
                    setValue("metadata.bookTypeId", newBookType.id, {
                      shouldDirty: true,
                    });
                  }}
                />
              </>
            ) : (
              <h1 className="text-2xl sm:text-2xl md:text-4xl lg:text-4xl w-full font-[Verdana] font-bold text-accent leading-tight overflow-hidden">
                {book.title}
              </h1>
            )}

            <div
              className="text-lg font-serif text-accent pl-4 px-1 pt-2 mt-0.5"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.074), rgba(0,0,0,0.0))",
              }}
            >
              {editMode ? (
                <>
                  <BookAuthorEntries
                    entries={watch("authors")}
                    onChange={(updatedAuthors) => {
                      setValue("authors", [...updatedAuthors], {
                        shouldDirty: true,
                      });
                    }}
                  />
                  <div className="mt-2">
                    <BookAuthorInput
                      placeholder="Start typing to find an author"
                      fetchSuggestions={authorInputSuggestions}
                      entries={watch("authors")}
                      onChange={(updatedAuthors) => {
                        setValue("authors", updatedAuthors, {
                          shouldDirty: true,
                        });
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <span className="italic">by </span>
                  {book.authors.map((ba, i) => (
                    <Link to={`/author/${ba.id}`} key={ba.id}>
                      <span className="text-xl hover:text-popover">
                        {ba.name}
                        {i < book.authors.length - 1 ? ", " : ""}
                      </span>
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="rounded-lg border-2 border-b-4 border-accent bg-muted px-2 sm:px-4 py-6 space-y-6">
            {/* Genres */}
            {editMode ? (
              <BookGenreEntries
                initialGenres={watch("genres") || []}
                fetchAllGenres={getAllGenres}
                onChange={(updatedGenres) => {
                  setValue("genres", [...updatedGenres], { shouldDirty: true });
                }}
              />
            ) : (
              <div className="flex flex-wrap items-start gap-3 text-sm font-[Verdana] pl-2">
                <div className="uppercase text-accent font-bold tracking-wider pt-1 whitespace-nowrap">
                  Genres:
                </div>
                <div className="flex flex-wrap gap-2">
                  {book.genres!.map((bg) => (
                    <Link to={`/genre/${bg.id}`} key={bg.id}>
                      <Badge className="rounded-full px-3 py-1 text-xs tracking-wide bg-accent text-background font-bold font-[Helvetica] hover:bg-accent hover:text-popover">
                        {bg.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Book Metadata */}
            <div className="grid gap-y-3 text-sm font-[Verdana]">
              {editMode ? (
                <>
                  <PublicationYearSelector
                    value={watch("metadata.publicationYear")}
                    onChange={(year) =>
                      setValue("metadata.publicationYear", year, {
                        shouldDirty: true,
                      })
                    }
                  />

                  <BookPageCountInput
                    value={watch("metadata.pageCount")}
                    onChange={(newCount) =>
                      setValue("metadata.pageCount", newCount, {
                        shouldDirty: true,
                      })
                    }
                  />

                  <BookLanguageInput
                    value={watch("metadata.originalLanguage")}
                    onChange={(language) =>
                      setValue("metadata.originalLanguage", language, {
                        shouldDirty: true,
                      })
                    }
                  />
                </>
              ) : (
                <>
                  <div className="col-span-2 bg-background px-2 py-2 rounded">
                    <div className="grid grid-cols-[auto_1fr] gap-x-4 items-center">
                      <div className="uppercase text-accent font-bold tracking-wider whitespace-nowrap">
                        Published in:
                      </div>
                      <div className="text-md text-accent">
                        {book.publicationYear}.
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-[auto_1fr] gap-x-4 items-center px-2">
                    <div className="uppercase text-accent font-bold tracking-wider whitespace-nowrap">
                      Pages:
                    </div>
                    <div className="text-md text-accent">{book.pageCount}</div>
                  </div>

                  <div className="col-span-2 bg-background px-2 py-2 rounded">
                    <div className="grid grid-cols-[auto_1fr] gap-x-4 items-center">
                      <div className="uppercase text-accent font-bold tracking-wider whitespace-nowrap">
                        Written in:
                      </div>
                      <span className="text-md uppercase text-accent overflow-hidden">
                        {book.originalLanguage}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {editMode ? (
            <div>
              <CommonDescriptionInput
                value={watch("metadata.description")}
                rows={8}
                onChange={(newDesc) =>
                  setValue("metadata.description", newDesc, {
                    shouldDirty: true,
                  })
                }
              />
            </div>
          ) : (
            <p className="text-lg leading-relaxed text-accent font-[Georgia] indent-4 whitespace-pre-line overflow-hidden w-full">
              {book.description}
            </p>
          )}
          {editMode ? (
            <div className="flex justify-end">
              <SubmitButton
                label="Update"
                errorLabel={globalFormError}
                onSubmit={handleSubmit(handleUpdateBook)}
                showCancel
                onCancel={() => setEditMode((prev) => !prev)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
