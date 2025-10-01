import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { BookUpdate } from "@/lib/types/book";
import { API_FILE_RESOURCES_URL, ApiError } from "@/lib/services/api-calls/api";
import { BookRatingStars } from "@/components/ui/book/book-rating-stars";
import { SquarePen, X } from "lucide-react";
import {
  BookCoverImageUpload,
  UploadLabel,
} from "@/components/ui/book/book-cover-image-upload";
import { CommonTextInput } from "@/components/ui/common/common-text-input";
import { BookAuthorEntries } from "@/components/ui/book/book-author-entries";
import { BookAuthorInput } from "@/components/ui/book/book-author-input";
import { BookGenreEntries } from "@/components/ui/book/book-genre-entries";
import { PublicationYearSelector } from "@/components/ui/book/book-publication-year-selector";
import { BookPageCountInput } from "@/components/ui/book/book-page-count-input";
import { BookLanguageInput } from "@/components/ui/book/book-language-input";
import { CommonSubmitButton } from "@/components/ui/common/common-submit-button";

import { useForm } from "react-hook-form";
import { BookTypePicker } from "@/components/ui/book/book-type-selector";
import { CommonDescriptionInput } from "@/components/ui/common/common-description-input";
import { getDirtyValues } from "@/lib/utils";
import { useLoading } from "@/lib/contexts/useLoading";
import {
  useAllBookTypes,
  useBook,
  useUpdateBook,
} from "@/lib/services/api-calls/hooks/useBookApi";
import { useAllGenres } from "@/lib/services/api-calls/hooks/useGenreApi";
import { BookRatingInput } from "@/components/ui/book/book-rating-input";
import { CommonDescription } from "@/components/ui/common/common-description";

export function BookPage() {
  //------------------------------------------------------------------------------
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };
  //------------------------------------------------------------------------------
  const { showLoadingScreen, hideLoadingScreen } = useLoading();
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editFormError, setEditFormError] = useState<string>();
  //------------------------------------------------------------------------------
  const updateBook = useUpdateBook();

  const [rating, setRating] = useState<number>(0);
  //------------------------------------------------------------------------------
  const {
    data: book,
    isFetching: isBookFetching,
    error: bookError,
  } = useBook(id);
  const {
    data: allBookTypes,
    isFetching: areBookTypesFetching,
    error: bookTypesError,
  } = useAllBookTypes();
  const {
    data: allGenres,
    isFetching: areGenresFetching,
    error: genresError,
  } = useAllGenres();
  //------------------------------------------------------------------------------
  const {
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { dirtyFields },
  } = useForm<BookUpdate>();
  //------------------------------------------------------------------------------
  useEffect(() => {
    if (!id) {
      navigate("/");
    }
  }, [id, navigate]);
  //------------------------------------------------------------------------------
  const fetching = isBookFetching || areBookTypesFetching || areGenresFetching;
  const error = bookError || bookTypesError || genresError;

  useEffect(() => {
    if (fetching) showLoadingScreen();
    else hideLoadingScreen();
  }, [fetching, showLoadingScreen, hideLoadingScreen]);
  //------------------------------------------------------------------------------
  useEffect(() => {
    if (book) {
      reset({
        ...(({ id: _id, coverImageUrl: _url, ...rest }) => rest)(book),
        coverImageFile: undefined,
      });

      setEditFormError(undefined);
    }
  }, [editMode, book, reset]);
  //------------------------------------------------------------------------------

  //==============================================================================
  const handleUpdateBook = async (allFields: BookUpdate) => {
    if (!book) return;

    const edits = getDirtyValues(allFields, dirtyFields);

    console.log(edits);

    if (Object.keys(edits).length <= 0)
      return setEditFormError("You haven’t made any changes.");

    updateBook.mutate(
      { id: book.id, edits: edits },
      {
        onError: (error: any) => {
          setEditFormError(error?.message || "Failed to update. Try again!");
        },
        onSuccess: () => {
          setEditMode(false);
        },
      }
    );
  }; //==============================================================================

  if (error)
    return (
      <div className="text-center p-10 text-lg font-mono text-destructive">
        {error instanceof ApiError
          ? error.detail
          : "An unexpected error occurred. Reload to try again."}
      </div>
    );
  return (
    <div className="flex-grow">
      <div className="flex justify-center md:justify-end mx-0 md:mx-2 mt-2 pt-2">
        <button
          title={editMode ? "Cancel Editing" : "Edit"}
          onClick={(e) => {
            setEditMode((prev) => !prev);
            e.currentTarget.blur();
          }}
          className="text-accent hover:text-popover"
        >
          {editMode ? (
            <X size={24} strokeWidth={5} />
          ) : (
            <SquarePen size={24} strokeWidth={3} />
          )}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-5 pt-2 pb-10 min-h-screen">
        {/* Cover */}
        <Card className="rounded-b-lg w-full mx-auto bg-accent rounded-t-lg md:sticky md:top-36 lg:top-28 self-start">
          <CardContent
            className="p-0 bg-background rounded-t-lg"
            style={{ aspectRatio: "2 / 3" }}
          >
            {editMode ? (
              <BookCoverImageUpload
                value={
                  book?.coverImageUrl
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
                  book?.coverImageUrl
                    ? `${API_FILE_RESOURCES_URL}${book.coverImageUrl}`
                    : "/cover_placeholder.jpg"
                }
                alt={`Cover of ${book?.title}`}
                className="w-full h-full rounded-t-lg border-t-2 border-x-2 border-accent bg-accent/95"
              />
            )}
          </CardContent>
          <CardFooter className="pb-2 flex flex-col px-4">
            {editMode ? (
              <UploadLabel />
            ) : (
              <div className="py-2">
                <div className="flex gap-5">
                  <BookRatingStars value={2.4} size={30} showEmptyStars />
                  <span className="text-[32px] font-bold text-muted font-[Candara] -mt-2">
                    {(2.4).toFixed(2)}
                  </span>
                </div>

                <div className="pl-1 -mt-2">
                  <h5 className="text-[14px] font-mono text-background text-start">
                    {(18587).toLocaleString("en-US")} ratings
                  </h5>
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
                <CommonTextInput
                  value={watch("title")}
                  onChange={(newTitle) => {
                    setValue("title", newTitle, { shouldDirty: true });
                  }}
                  maxLength={128}
                  showCharCount
                />
                <BookTypePicker
                  value={watch("bookType")}
                  allBookTypes={allBookTypes}
                  onChange={(newBookType) => {
                    setValue("bookType", newBookType, {
                      shouldDirty: true,
                    });
                  }}
                />
              </>
            ) : (
              <h1 className="text-2xl sm:text-2xl md:text-4xl lg:text-4xl w-full font-[Verdana] font-bold text-accent leading-tight overflow-hidden">
                {book?.title}
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
                  {book?.authors.map((ba, i) => (
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
                initialGenres={watch("genres")}
                allGenres={allGenres}
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
                  {book?.genres!.map((bg) => (
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
                    value={watch("publicationYear")}
                    onChange={(year) =>
                      setValue("publicationYear", year, {
                        shouldDirty: true,
                      })
                    }
                  />

                  <BookPageCountInput
                    value={watch("pageCount")}
                    onChange={(newCount) =>
                      setValue("pageCount", newCount, {
                        shouldDirty: true,
                      })
                    }
                  />

                  <BookLanguageInput
                    value={watch("originalLanguage")}
                    onChange={(language) =>
                      setValue("originalLanguage", language, {
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
                      <div className="text-lg text-accent font-[Georgia]">
                        {book?.publicationYear}.
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-[auto_1fr] gap-x-4 items-center px-2">
                    <div className="uppercase text-accent font-bold tracking-wider whitespace-nowrap">
                      Pages:
                    </div>
                    <div className="text-lg text-accent font-[Georgia]">
                      {book?.pageCount}
                    </div>
                  </div>

                  <div className="col-span-2 bg-background px-2 py-2 rounded">
                    <div className="grid grid-cols-[auto_1fr] gap-x-4 items-center">
                      <div className="uppercase text-accent font-bold tracking-wider whitespace-nowrap">
                        Written in:
                      </div>
                      <span className="uppercase text-accent overflow-hidden font-sans font-semibold">
                        {book?.originalLanguage}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          {editMode ? (
            <CommonDescriptionInput
              value={watch("description")}
              rows={8}
              onChange={(newDesc) =>
                setValue("description", newDesc, {
                  shouldDirty: true,
                })
              }
            />
          ) : (
            <CommonDescription
              value={book?.description}
              showBackground={false}
              fontSize={18}
              maxPreviewLength={500}
            />
          )}
          {editMode ? (
            <div className="flex justify-end">
              <CommonSubmitButton
                label="Update"
                errorLabel={editFormError}
                onClick={handleSubmit(handleUpdateBook)}
                showCancel
                onCancel={() => setEditMode((prev) => !prev)}
              />
            </div>
          ) : null}
          <div className="p-2 px-4 rounded-2xl border-b-8  border-2 border-accent bg-muted">
            <h5 className="text-xl font-semibold">
              What would you rate{" "}
              <span className="italic text-popover">{book?.title}</span>?
            </h5>
            <div className="px-2 pt-1 flex justify-end">
              <BookRatingInput value={rating} size={34} onChange={setRating} />
            </div>
            <h5 className="text-xl font-semibold">What did you think of it?</h5>
            <div className="pl-2 mt-1">
              <CommonDescriptionInput rows={8} maxLength={2000} />
            </div>
            <div className="flex justify-end mt-2">
              <CommonSubmitButton label="Post Review" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
