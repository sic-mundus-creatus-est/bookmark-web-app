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
import { CommonDescription } from "@/components/ui/common/common-description";
import { BookReviewCard } from "@/components/ui/book/book-review-card";
import { PostReviewForm } from "@/components/layouts/post-review-form";
import {
  useCreateBookReview,
  useCurrentUserBookReview,
  useDeleteBookReview,
  useLatestBookReviews,
} from "@/lib/services/api-calls/hooks/useUserApi";
import { useAuth } from "@/lib/contexts/useAuth";
import { Pagination } from "@/components/pagination";
import { CurrentUserBookReview } from "@/components/current-user-book-review";

export function BookPage() {
  //------------------------------------------------------------------------------
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };
  //------------------------------------------------------------------------------
  const { user: currentUser } = useAuth();
  const { showLoadingScreen, hideLoadingScreen } = useLoading();
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editFormError, setEditFormError] = useState<string>();
  //------------------------------------------------------------------------------
  const updateBook = useUpdateBook();

  const [newReview, setNewReview] = useState<{
    rating?: number;
    content?: string;
  }>();

  const createBookReview = useCreateBookReview();
  const deleteBookReview = useDeleteBookReview();
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
  const { data: currentUserReview } = useCurrentUserBookReview(id, currentUser);

  const [reviewPageIndex, setReviewPageIndex] = useState(1);

  const reviewPageSize = 5;
  const hasReviews = (book?.ratingsCount ?? 0) > 0;

  const { data: bookReviews } = useLatestBookReviews(
    id,
    reviewPageIndex,
    reviewPageSize
  );
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
  };

  const handleCreateReview = async () => {
    if (!book) return;

    if (book!.ratingsCount! >= 0 && newReview?.rating && newReview.rating > 0) {
      const totalRatingBefore = book!.averageRating! * book!.ratingsCount!;
      book!.ratingsCount!++;
      const totalRatingAfter = totalRatingBefore + newReview.rating;
      book!.averageRating = totalRatingAfter / book!.ratingsCount!;
    } else {
      book!.ratingsCount = 1;
      book!.averageRating = newReview?.rating ?? 0;
    }

    createBookReview.mutate(
      { bookId: book.id, ...newReview },
      {
        onError: (error: any) => {
          console.log(error.message);
        },
      }
    );
  };

  const handleDeleteReview = () => {
    setNewReview(undefined);
    book!.ratingsCount!--;
    if (book!.ratingsCount! > 0 && currentUserReview!.rating > 0) {
      const totalRatingBefore =
        book!.averageRating! * (book!.ratingsCount! + 1);
      const totalRatingAfter = totalRatingBefore - currentUserReview!.rating;
      book!.averageRating = totalRatingAfter / book!.ratingsCount!;
    } else {
      book!.averageRating = 0;
    }

    deleteBookReview.mutate({
      userId: currentUserReview!.user.id,
      bookId: currentUserReview!.bookId,
    });
  };

  //==============================================================================

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
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-5 pt-2 pb-10">
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
                <span className="inline-flex gap-5">
                  <BookRatingStars
                    value={book?.averageRating}
                    size={30}
                    showEmptyStars
                  />
                  <span className="text-[32px] font-bold text-muted font-[Candara] leading-tight">
                    {book?.averageRating != null && book?.averageRating != 0
                      ? book.averageRating.toFixed(2)
                      : "N/A"}
                  </span>
                </span>

                <h5 className="pl-1 -mt-1 text-[14px] font-mono text-background text-start">
                  {(book?.ratingsCount ?? 18587).toLocaleString("en-US")}{" "}
                  ratings
                </h5>
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
                  <div className="col-span-2 bg-background px-2 py-1 rounded">
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
          {editMode && (
            <div className="flex justify-end">
              <CommonSubmitButton
                label="Update"
                errorLabel={editFormError}
                onClick={handleSubmit(handleUpdateBook)}
                showCancel
                onCancel={() => setEditMode((prev) => !prev)}
              />
            </div>
          )}
          {!editMode && (
            <div className="flex flex-col gap-4">
              {currentUser && !currentUserReview && (
                <PostReviewForm
                  subjectTitle={book?.title}
                  rating={newReview?.rating}
                  content={newReview?.content}
                  onRatingChange={(rating) => {
                    setNewReview({ ...newReview, rating: rating });
                  }}
                  onContentChange={(content) => {
                    setNewReview({ ...newReview, content: content });
                  }}
                  onSubmit={handleCreateReview}
                />
              )}
              {hasReviews && (
                <>
                  {currentUser && currentUserReview && (
                    <CurrentUserBookReview
                      review={currentUserReview}
                      onDelete={handleDeleteReview}
                    />
                  )}
                  <div className="flex flex-col">
                    <h4 className="pl-1 text-xl font-bold font-[Verdana] border-accent border-b-4 rounded-b-sm">
                      Community Reviews
                    </h4>
                  </div>
                  {bookReviews?.items?.map((review) => (
                    <BookReviewCard
                      key={`${review.user.id}-${review.bookId}`}
                      rating={review.rating}
                      content={review.content}
                      user={review.user}
                      postedOn={new Date(review.createdAt)}
                    />
                  ))}
                  {bookReviews && (
                    <Pagination
                      currentPage={reviewPageIndex}
                      totalPages={bookReviews.totalPages}
                      onPageChange={(page) => {
                        setReviewPageIndex(page);
                      }}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
