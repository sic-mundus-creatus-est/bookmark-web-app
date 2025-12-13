import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { BookUpdate } from "@/lib/types/book";
import { ApiError } from "@/lib/services/api-calls/api";
import { CommonSubmitButton } from "@/components/ui/common/common-submit-button";

import { useForm } from "react-hook-form";
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
import { PostBookReviewForm } from "@/components/layouts/post-book-review-form";
import {
  useCreateBookReview,
  useCurrentUserBookReview,
  useDeleteBookReview,
  useLatestBookReviews,
} from "@/lib/services/api-calls/hooks/useUserApi";
import { useAuth } from "@/lib/contexts/useAuth";
import { CurrentUserBookReview } from "@/components/ui/book/current-user-book-review";
import { BookCommunityReviewsPage } from "@/components/ui/book/book-community-reviews-page";
import { BookMetadata } from "@/components/ui/book/book-metadata";
import { BookMetadataEditForm } from "@/components/ui/book/book-metadata-edit";
import { BookPageCoverCard } from "@/components/ui/book/book-page-cover-card";
import { BookPageCoverCardEdit } from "@/components/ui/book/book-page-cover-card-edit";
import { BookMainMetadataEdit } from "@/components/ui/book/book-main-metadata-edit";
import { BookMainMetadata } from "@/components/ui/book/book-main-metadata";
import { CommonEditButton } from "@/components/ui/common/common-edit-button";
import { CommonDeleteButton } from "@/components/ui/common/common-delete-button";

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
      <CommonEditButton
        value={editMode}
        onClick={() => setEditMode((prev) => !prev)}
      />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-5 pt-2 pb-10">
        {editMode ? (
          <>
            <BookPageCoverCardEdit book={book} setValue={setValue} />
            <div className="flex flex-col gap-5 min-w-0">
              <BookMainMetadataEdit
                allBookTypes={allBookTypes}
                watch={watch}
                setValue={setValue}
              />
              <BookMetadataEditForm
                watch={watch}
                setValue={setValue}
                allGenres={allGenres}
              />
              <CommonDescriptionInput
                value={watch("description")}
                rows={8}
                onChange={(newDesc) =>
                  setValue("description", newDesc, {
                    shouldDirty: true,
                  })
                }
              />

              <div className="flex justify-between items-center">
                <CommonDeleteButton onClick={() => {}} />
                <CommonSubmitButton
                  label="Update"
                  errorLabel={editFormError}
                  onClick={handleSubmit(handleUpdateBook)}
                  showCancel
                  onCancel={() => setEditMode((prev) => !prev)}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <BookPageCoverCard book={book} />
            <div className="flex flex-col gap-5 min-w-0">
              <BookMainMetadata book={book} />
              <BookMetadata book={book} />
              <CommonDescription
                value={book?.description}
                showBackground={false}
                fontSize={18}
                maxPreviewLength={500}
              />
              <div className="flex flex-col gap-4">
                {currentUser && !currentUserReview && (
                  <PostBookReviewForm
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
                    <BookCommunityReviewsPage
                      reviews={bookReviews}
                      currentPage={reviewPageIndex}
                      onPageChange={(page) => {
                        setReviewPageIndex(page);
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
