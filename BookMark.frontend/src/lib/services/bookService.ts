import { z } from "zod";
import { Book, CreateBookParams } from "../types/book";
import { createBook } from "./api-calls/bookService";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_FILE_SIZE = 10000000; // 10MB

const validateBook = z.object({
  title: z.string().min(1, "Title is required!").max(128),
  authorsWithRoles: z
    .array(
      z.object({
        authorId: z.string(),
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
