import { BookReview } from "@/lib/types/book";
import {
  createBookReview,
  deleteBookReview,
  getCurrentUserBookReview,
  getLatestBookReviews,
} from "../userApi";
import { ApiError } from "../api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Page } from "@/lib/types/common";
import { UserAuth } from "@/lib/types/user";

const KEY_BOOK_REVIEW = "book_review";
const KEY_BOOK_REVIEWS = "book_reviews";
const KEY_BY_USER = "by_user";

//--------------------------------------------------------------------------
// QUERIES
export function useCurrentUserBookReview(
  bookId: string,
  currentUser?: UserAuth
) {
  return useQuery<BookReview, ApiError>({
    queryKey: [KEY_BOOK_REVIEW, bookId],
    queryFn: () => getCurrentUserBookReview(bookId),
    enabled: !!bookId && bookId.trim() !== "" && !!currentUser,
  });
}

export function useLatestBookReviews(
  bookId: string,
  pageIndex: number,
  pageSize: number
) {
  return useQuery<Page<BookReview>, ApiError>({
    queryKey: [KEY_BOOK_REVIEWS, bookId, pageIndex, pageSize],
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
    queryFn: () => getLatestBookReviews(userId, pageIndex, pageSize),
    enabled: !!userId,
  });
}
//--------------------------------------------------------------------------

//--------------------------------------------------------------------------
// MUTATIONS
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
      queryClient.invalidateQueries({ queryKey: [KEY_BOOK_REVIEWS] });
    },
  });
}

export function useDeleteBookReview() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { userId: string; bookId: string }>({
    mutationFn: ({ userId, bookId }) => deleteBookReview(userId, bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KEY_BOOK_REVIEWS] });
    },
  });
}
//--------------------------------------------------------------------------
