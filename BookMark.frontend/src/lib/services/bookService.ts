import { z } from "zod";
import { Book, CreateBookParams, EditedBookData } from "../types/book";
import {
  createBook,
  removeBookCoverImage,
  updateBook,
  updateBookAuthors,
  updateBookCoverImage,
  updateBookGenres,
} from "./api-calls/bookService";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_FILE_SIZE = 10000000; // 10MB

const validateBook = z.object({
  title: z.string().min(1, "Title is required!").max(128),
  authorsWithRoles: z
    .array(
      z.object({
        id: z.string(),
        roleId: z.number(),
      })
    )
    .min(1, "At least one author required!")
    .max(16),
  genreIds: z.array(z.string()).min(1, "At least one genre required!").max(16),
  publicationYear: z.number().int().min(1000).max(new Date().getFullYear()),
  pageCount: z.number().int().min(1, "Must have at least 1 page!"),
  originalLanguage: z.string().min(1, "Original language is required!"),
  description: z.string().optional(),
  coverImageFile: z
    .instanceof(File)
    .optional()
    .refine((file) => {
      if (!file) return true;
      return ACCEPTED_IMAGE_TYPES.includes(file.type);
    }, "Invalid file. Choose either JPEG, JPG or PNG image.")
    .refine((file) => {
      if (!file) return true;
      return file.size > 0 && file.size <= MAX_FILE_SIZE;
    }, "File must not be empty and must be under 10MB."),
});

export async function validateAndCreateBook(data: CreateBookParams) {
  const validationResult = validateBook.safeParse(data);
  if (!validationResult.success) {
    return {
      success: false,
      error:
        validationResult.error.issues[0]?.message ??
        "Please check the form for errors!",
    };
  }

  try {
    const result: Book = await createBook(data);
    return { success: true, bookId: result.id };
  } catch (err: any) {
    console.error(
      `ERROR WHILE CREATING BOOK:`,
      `\n----------------------------------`,
      `\n[${err.instance}]`,
      `\nError: ${err.status}`,
      `\n----------------------------------`,
      `\nType: ${err.type}`,
      `\nTitle: ${err.title}`,
      `\nDetail: ${err.detail}`,
      `\nTrace ID: ${err.traceId}`
    );

    return {
      success: false,
      error:
        "Failed to create the book. Please try again or check your connection.",
    };
  }
}

const updateValidation = z.object({
  title: z
    .string()
    .min(1, "Title is required!")
    .max(128, "Title must be at most 128 characters long.")
    .optional(),
  publicationYear: z
    .number()
    .int()
    .min(1, "Publication year cannot be 0 or negative.")
    .max(new Date().getFullYear())
    .optional(),
  pageCount: z.number().int().min(1, "Must have at least 1 page!").optional(),
  originalLanguage: z
    .string()
    .min(1, "Original language is required!")
    .optional(),
  description: z.string().optional(),
  coverImageFile: z
    .instanceof(File)
    .optional()
    .refine((file) => {
      if (!file) return true;
      return ACCEPTED_IMAGE_TYPES.includes(file.type);
    }, "Invalid file. Choose either JPEG, JPG or PNG image.")
    .refine((file) => {
      if (!file) return true;
      return file.size > 0 && file.size <= MAX_FILE_SIZE;
    }, "File must not be empty and must be under 10MB."),
});

export async function validateAndUpdateBook(data: EditedBookData) {
  const validationResult = updateValidation.safeParse(data);
  if (!validationResult.success) {
    return {
      success: false,
      error:
        validationResult.error.issues[0]?.message ??
        "Please check the form for errors!",
    };
  }

  try {
    const tasks: Promise<unknown>[] = [];

    tasks.push(updateBook(data));

    if (data.authors) {
      const simplifiedAuthors = data.authors.map((author) => ({
        id: author.id,
        roleId: author.roleId,
      }));
      tasks.push(updateBookAuthors(data.id, simplifiedAuthors));
    }

    if (data.genres) {
      tasks.push(
        updateBookGenres(
          data.id,
          data.genres.map((genre) => genre.id)
        )
      );
    }

    if (data.coverImageFile != undefined) {
      const imageTask = data.coverImageFile
        ? updateBookCoverImage(data.id, data.coverImageFile)
        : removeBookCoverImage(data.id);
      tasks.push(imageTask);
    }

    const results = await Promise.allSettled(tasks);

    const anyFailed = results.some((r) => r.status === "rejected");

    if (anyFailed) {
      console.error("One or more update steps failed:", results);
      return {
        success: false,
        error:
          "Update incomplete. Some parts of the book were not saved. Reload to see which...",
      };
    }

    return { success: true };
  } catch (err: any) {
    console.error(
      `ERROR WHILE UPDATING BOOK:`,
      `\n----------------------------------`,
      `\n[${err.instance}]`,
      `\nError: ${err.status}`,
      `\n----------------------------------`,
      `\nType: ${err.type}`,
      `\nTitle: ${err.title}`,
      `\nDetail: ${err.detail}`,
      `\nTrace ID: ${err.traceId}`
    );

    return {
      success: false,
      error:
        "Failed to create the book. Please try again or check your connection.",
    };
  }
}
