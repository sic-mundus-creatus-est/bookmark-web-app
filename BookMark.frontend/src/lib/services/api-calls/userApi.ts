import { BookReview } from "@/lib/types/book";
import { apiCall, DELETE, GET, POST, PUT } from "./api";
import { Page } from "@/lib/types/common";
import { User, UserUpdate } from "@/lib/types/user";

export function getUserById(id: string): Promise<User> {
  return apiCall({ method: GET, endpoint: `/api/users/get/${id}` });
}

export function updateUserProfile(data: UserUpdate): Promise<User> {
  return apiCall({
    method: PUT,
    endpoint: "/api/users/update-profile",
    body: data,
  });
}

export function createBookReview(data: {
  bookId: string;
  rating?: number;
  content?: string;
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
