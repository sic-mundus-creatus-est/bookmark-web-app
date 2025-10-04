import { BookReview } from "@/lib/types/book";
import { apiCall, DELETE, GET, POST } from "./api";
import { Page } from "@/lib/types/common";

export function createBookReview(data: {
  bookId: string;
  rating: number;
  content: string;
}): Promise<BookReview> {
  return apiCall({
    method: POST,
    endpoint: "/api/users/create-book-review",
    body: data,
  });
}

export function getCurrentUserBookReview(bookId: string): Promise<BookReview> {
  return apiCall({
    method: GET,
    endpoint: `/api/users/get-current-user-book-review/${bookId}`,
  });
}

export function getBookReviewStats(
  bookId: string
): Promise<{ averageRating: number; reviewCount: number }> {
  return apiCall({
    method: GET,
    endpoint: `/api/users/get-book-review-stats/${bookId}`,
  });
}

export function getLatestBookReviews(
  bookId: string,
  pageIndex: number,
  pageSize: number
): Promise<Page<BookReview>> {
  return apiCall({
    method: GET,
    endpoint: `/api/users/get-latest-book-reviews/${bookId}?pageIndex=${pageIndex}&pageSize=${pageSize}`,
  });
}

export function getLatestBookReviewsByUser(
  userId: string,
  pageIndex: number,
  pageSize: number
): Promise<Page<BookReview>> {
  return apiCall({
    method: GET,
    endpoint: `/api/users/get-latest-book-reviews-by-user/${userId}?pageIndex=${pageIndex}&pageSize=${pageSize}`,
  });
}

export function deleteBookReview(userId: string, bookId: string) {
  return apiCall({
    method: DELETE,
    endpoint: `/api/users/delete-book-review/${userId}/${bookId}`,
  });
}
