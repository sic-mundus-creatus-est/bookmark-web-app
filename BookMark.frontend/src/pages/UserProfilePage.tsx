import { AuthorizedOnly } from "@/components/AuthorizedOnly";
import { Pagination } from "@/components/pagination";
import { BookReviewCard } from "@/components/ui/book/book-review-card";
import { CommonDeleteButton } from "@/components/ui/common/common-delete-button";
import { CommonDescription } from "@/components/ui/common/common-description";
import { CommonDescriptionInput } from "@/components/ui/common/common-description-input";
import { CommonEditButton } from "@/components/ui/common/common-edit-button";
import {
  CommonErrorLabel,
  CommonSubmitButton,
} from "@/components/ui/common/common-submit-button";
import { CommonTextInput } from "@/components/ui/common/common-text-input";
import { user_roles } from "@/config/roles";
import { useLoading } from "@/lib/contexts/useLoading";
import { API_FILE_RESOURCES_URL, ApiError } from "@/lib/services/api-calls/api";
import {
  useDeleteUser,
  useLatestBookReviewsByUser,
  useUpdateUserProfile,
  useUser,
} from "@/lib/services/api-calls/hooks/useUserApi";
import { BookReview } from "@/lib/types/book";
import { UserUpdate } from "@/lib/types/user";
import { getDirtyValues } from "@/lib/utils";
import { SquareUserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";

export function UserProfilePage() {
  //------------------------------------------------------------------------------
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };
  const { showLoadingScreen, hideLoadingScreen } = useLoading();
  //------------------------------------------------------------------------------
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editFormError, setEditFormError] = useState<string>();
  //------------------------------------------------------------------------------
  const {
    data: user,
    isFetching: isUserFetching,
    error: userError,
  } = useUser(id);

  const {
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { dirtyFields },
  } = useForm<UserUpdate>();

  const reviewPageSize = 5;
  const [reviewPageIndex, setReviewPageIndex] = useState(1);
  const { data: userReviews } = useLatestBookReviewsByUser(
    id,
    reviewPageIndex,
    reviewPageSize
  );
  //------------------------------------------------------------------------------
  useEffect(() => {
    if (!id) {
      navigate("/");
    }
  }, [id, navigate]);

  useEffect(() => {
    if (isUserFetching) showLoadingScreen();
    else hideLoadingScreen();
  }, [isUserFetching, showLoadingScreen, hideLoadingScreen]);

  useEffect(() => {
    if (editMode && user) {
      reset(user);
    } else if (!editMode) {
      reset();
      setEditFormError(undefined);
    }
  }, [editMode, user, reset]);
  //==============================================================================
  const updateUserProfile = useUpdateUserProfile(id);
  const handleUpdateUserProfile = async (allFields: UserUpdate) => {
    const edits = getDirtyValues(allFields, dirtyFields);

    if (Object.keys(edits).length <= 0)
      return setEditFormError("You haven’t made any changes.");

    updateUserProfile.mutate(edits, {
      onError: (error: any) => {
        if (error instanceof ApiError) setEditFormError(error.detail);
        else setEditFormError("An unexpected error occurred. Try again later.");
      },
      onSuccess: () => {
        setEditMode(false);
      },
    });
  };
  //==============================================================================
  const deleteUser = useDeleteUser(id);
  const handleDeleteUser = () => {
    deleteUser.mutate(
      { userId: id },
      {
        onSuccess: () => {
          navigate("/home");
        },
      }
    );
  };
  //==============================================================================

  if (userError)
    return (
      <div className="text-center p-10 text-lg font-mono text-destructive">
        {userError instanceof ApiError
          ? userError.detail
          : "An unexpected error occurred. Reload to try again."}
      </div>
    );
  return (
    <div className="my-4">
      <div className="w-full bg-accent flex flex-col pt-7 pb-4 rounded-t-3xl rounded-b-sm px-4 sm:px-10 lg:px-40">
        <AuthorizedOnly role={user_roles.admin} userId={id} silent>
          <CommonEditButton
            value={editMode}
            onClick={() => setEditMode((prev) => !prev)}
            className="text-muted"
          />
        </AuthorizedOnly>

        {editMode ? (
          <>
            <div className="flex flex-row items-center gap-2">
              <SquareUserRound
                size={100}
                strokeWidth={1}
                className="text-popover"
              />
              <CommonTextInput
                label="Name"
                labelStyle={{ color: "hsl(var(--popover))", fontSize: "14px" }}
                placeholder="Name"
                maxLength={64}
                value={watch("displayName")}
                onChange={(newName: string) => {
                  setValue("displayName", newName, { shouldDirty: true });
                }}
                singleLine
                fontSize={17}
              />
            </div>
            <CommonDescriptionInput
              label="About Me"
              labelStyle={{ color: "hsl(var(--popover))" }}
              textSize={16}
              placeholder="Write something cool about you..."
              maxLength={2000}
              value={watch("aboutMe")}
              onChange={(aboutMe: string) => {
                setValue("aboutMe", aboutMe, { shouldDirty: true });
              }}
            />
            {editFormError && <CommonErrorLabel error={editFormError} />}
            <div className="flex justify-between">
              <CommonDeleteButton
                onClick={handleDeleteUser}
                className="text-muted"
              />
              <CommonSubmitButton
                label="Update"
                onClick={handleSubmit(handleUpdateUserProfile)}
                showCancel
                onCancel={() => setEditMode((prev) => !prev)}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-row items-center gap-2">
              <SquareUserRound
                size={100}
                strokeWidth={1}
                className="text-popover"
              />
              <div>
                <h4 className="font-bold text-muted text-xl font-[Helvetica]">
                  {user?.displayName ? user.displayName : `@${user?.username}`}
                </h4>
                {user?.displayName && (
                  <h5 className="font-bold -mt-1 text-muted font-[Candara] italic text-[17px]">
                    @{user.username}
                  </h5>
                )}
              </div>
            </div>
            <CommonDescription placeholder=". . ." value={user?.aboutMe} />
          </>
        )}
      </div>

      {!editMode && (
        <>
          <h4 className="font-bold text-xl mb-2 mt-3 px-3 py-1 bg-popover rounded-sm text-muted font-[Candara] italic">
            LATEST REVIEWS:
          </h4>

          {userReviews?.items?.map((review: BookReview) => (
            <div
              className="border-2 border-b-4 rounded-lg mb-4 bg-muted"
              key={review.bookId}
            >
              <h5 className="font-bold px-2 pt-1 text-[20px] leading-tight tracking-tighter font-[Helvetica]">
                {review.bookTitle}
              </h5>
              <hr className="border-t-2 border-accent pb-2 mx-1" />
              <div className="flex items-start gap-2 px-2 pb-1">
                <div className="aspect-[2/3] w-20 sm:w-28 flex-shrink-0">
                  <Link to={`/book/${review.bookId}`}>
                    <img
                      src={
                        review?.bookCoverImageUrl
                          ? `${API_FILE_RESOURCES_URL}${review.bookCoverImageUrl}`
                          : "/cover_placeholder.jpg"
                      }
                      alt={`Cover of ${review?.bookTitle}`}
                      className="w-full h-full rounded-sm border-t-2 border-x-2 border-accent bg-accent/95"
                    />
                  </Link>
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

          {userReviews && userReviews?.totalPages > 1 && (
            <Pagination
              currentPage={reviewPageIndex}
              totalPages={userReviews.totalPages}
              onPageChange={(page) => {
                setReviewPageIndex(page);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
