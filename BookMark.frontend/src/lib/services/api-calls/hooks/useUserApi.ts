import { BookReview } from "@/lib/types/book";
import {
  createBookReview,
  deleteBookReview,
  deleteUser,
  getCurrentUserBookReview,
  getLatestBookReviews,
  getLatestBookReviewsByUser,
  getUserById,
  updateUserProfile,
} from "../userApi";
import { ApiError } from "../api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Page } from "@/lib/types/common";
import { User, UserAuth, UserUpdate } from "@/lib/types/user";

const KEY_USER = "user";
const KEY_CURRENT_USER_BOOK_REVIEW = "current_user_book_review";
const KEY_BOOK_REVIEWS = "book_reviews";
const KEY_BY_USER = "by_user";

//--------------------------------------------------------------------------
// QUERIES
export function useUser(id: string) {
  return useQuery<User, ApiError>({
    queryKey: [KEY_USER, id],
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
}

export function useCurrentUserBookReview(
  bookId: string,
  currentUser?: UserAuth
) {
  return useQuery<BookReview, ApiError>({
    queryKey: [KEY_CURRENT_USER_BOOK_REVIEW, bookId],
    queryFn: () => getCurrentUserBookReview(bookId),
    enabled: !!bookId && !!currentUser,
  });
}

export function useLatestBookReviews(
  bookId: string,
  pageIndex: number,
  pageSize: number
) {
  return useQuery<Page<BookReview>, ApiError>({
    queryKey: [KEY_BOOK_REVIEWS, bookId, pageIndex],
    queryFn: () => getLatestBookReviews(bookId, pageIndex, pageSize),
    enabled: !!bookId,
  });
}

export function useLatestBookReviewsByUser(
  userId: string,
  pageIndex: number,
  pageSize: number
) {
  return useQuery<Page<BookReview>, ApiError>({
    queryKey: [KEY_BOOK_REVIEWS, KEY_BY_USER, userId, pageIndex, pageSize],
    queryFn: () => getLatestBookReviewsByUser(userId, pageIndex, pageSize),
    enabled: !!userId,
  });
}
//--------------------------------------------------------------------------

//--------------------------------------------------------------------------
// MUTATIONS

export function useUpdateUserProfile(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserUpdate) => updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY_USER, userId] });
      queryClient.invalidateQueries({
        queryKey: [KEY_CURRENT_USER_BOOK_REVIEW],
        refetchType: "all", // so that it updates on other pages too
      });
      queryClient.invalidateQueries({
        queryKey: [KEY_BOOK_REVIEWS],
        refetchType: "all",
      });
    },
  });
}

export function useCreateBookReview() {
  const queryClient = useQueryClient();

  return useMutation<
    BookReview,
    ApiError,
    { bookId: string; rating?: number; content?: string }
  >({
    mutationFn: (data: { bookId: string; rating?: number; content?: string }) =>
      createBookReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [KEY_CURRENT_USER_BOOK_REVIEW],
      });
      queryClient.invalidateQueries({
        queryKey: [KEY_BOOK_REVIEWS],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["books"],
        refetchType: "all",
      });
    },
  });
}

export function useDeleteBookReview(bookId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { userId: string; bookId: string }>({
    mutationFn: ({ userId, bookId }) => deleteBookReview(userId, bookId),
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: [KEY_CURRENT_USER_BOOK_REVIEW, bookId],
      });
      queryClient.invalidateQueries({
        queryKey: [KEY_BOOK_REVIEWS],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["books"],
        refetchType: "all",
      });
    },
  });
}

export function useDeleteUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { userId: string }>({
    mutationFn: ({ userId }) => deleteUser(userId),
    onSuccess: () => {
      queryClient.setQueryData([KEY_USER, userId], undefined);
      queryClient.invalidateQueries({
        queryKey: [KEY_BOOK_REVIEWS],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: [KEY_CURRENT_USER_BOOK_REVIEW],
        refetchType: "all",
      });
    },
  });
}
//--------------------------------------------------------------------------
