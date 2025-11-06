import { BookReviewCard } from "@/components/ui/book/book-review-card";
import { CommonDescription } from "@/components/ui/common/common-description";
import { CommonDescriptionInput } from "@/components/ui/common/common-description-input";
import { CommonSubmitButton } from "@/components/ui/common/common-submit-button";
import { CommonTextInput } from "@/components/ui/common/common-text-input";
import { useLoading } from "@/lib/contexts/useLoading";
import { API_FILE_RESOURCES_URL, ApiError } from "@/lib/services/api-calls/api";
import {
  useLatestBookReviewsByUser,
  useUser,
} from "@/lib/services/api-calls/hooks/useUserApi";
import { BookReview } from "@/lib/types/book";
import { SquarePen, SquareUserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function UserProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };

  const { showLoadingScreen, hideLoadingScreen } = useLoading();

  const [editMode, setEditMode] = useState<boolean>(false);

  const {
    data: user,
    isFetching: isUserFetching,
    error: userError,
  } = useUser(id);

  const { data: userReviews } = useLatestBookReviewsByUser(id, 1, 7);

  useEffect(() => {
    if (!id) {
      navigate("/");
    }
  }, [id, navigate]);

  useEffect(() => {
    if (isUserFetching) showLoadingScreen();
    else hideLoadingScreen();
  }, [isUserFetching, showLoadingScreen, hideLoadingScreen]);

  if (userError)
    return (
      <div className="text-center p-10 text-lg font-mono text-destructive">
        {userError instanceof ApiError
          ? userError.detail
          : "An unexpected error occurred. Reload to try again."}
      </div>
    );
  return (
    <div className="mt-4">
      <div className="w-full bg-accent flex flex-col items-center pt-7 pb-4 rounded-t-3xl rounded-b-sm px-4 sm:px-10 lg:px-40">
        <div className="w-full flex justify-between items-center mb-4">
          <br />
          <button
            title={editMode ? "Cancel Editing" : "Edit"}
            onClick={(e) => {
              setEditMode((prev) => !prev);
              e.currentTarget.blur();
            }}
            className="text-muted hover:text-popover"
          >
            {editMode ? (
              <X size={24} strokeWidth={5} />
            ) : (
              <SquarePen size={24} strokeWidth={3} />
            )}
          </button>
        </div>
        <SquareUserRound size={100} strokeWidth={1} className="text-popover" />
        {editMode ? (
          <>
            <span className="text-muted">
              <CommonTextInput
                placeholder="Display Name"
                value={user?.displayName}
                singleLine
                fontSize={17}
              />
            </span>
            <h5 className="font-bold -mt-1 text-muted ">@{user?.username}</h5>
            <div className="w-full mt-3">
              <CommonDescriptionInput
                placeholder="About Me"
                value={user?.aboutMe}
              />
            </div>
            <div className="flex justify-end">
              <CommonSubmitButton label="Update" showCancel />
            </div>
          </>
        ) : (
          <>
            <h4 className="font-bold text-muted ">{user?.displayName}</h4>
            <h5 className="font-bold -mt-1 text-muted ">@{user?.username}</h5>
            <br className="mt-2" />
            <CommonDescription placeholder=". . ." value={user?.aboutMe} />
          </>
        )}
      </div>

      {!editMode && (
        <>
          <h4 className="font-bold text-xl mb-2 mt-3 pl-3">Latest Reviews:</h4>

          {userReviews?.items?.map((review: BookReview) => (
            <div
              className="border-2 border-b-4 rounded-lg mb-4 bg-muted"
              key={review.bookId}
            >
              <h5 className="font-bold pl-2 text-lg">{review.bookTitle}</h5>
              <div className="flex items-start gap-2 p-2">
                <div className="aspect-[2/3] w-28">
                  <img
                    src={
                      review?.bookCoverImageUrl
                        ? `${API_FILE_RESOURCES_URL}${review.bookCoverImageUrl}`
                        : "/cover_placeholder.jpg"
                    }
                    alt={`Cover of ${review?.bookTitle}`}
                    className="w-full h-full rounded-sm border-t-2 border-x-2 border-accent bg-accent/95"
                  />
                </div>

                <BookReviewCard
                  rating={review.rating}
                  content={review.content}
                  user={review.user}
                  postedOn={new Date(review.createdAt)}
                />
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
