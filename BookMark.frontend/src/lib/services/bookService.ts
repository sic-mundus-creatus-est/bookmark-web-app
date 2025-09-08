import { z } from "zod";
import { Book, EditedBook } from "../types/book";
import {
  createBook,
  updateBookMetadata,
  updateBookAuthors,
  updateBookCoverImage,
  updateBookGenres,
  CreateBookParams,
} from "./api-calls/bookApi";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const MAX_FILE_SIZE = 10000000; // 10MB

const validateBook = z.object({
  title: z.string().min(1, "Title is required!").max(128),
  bookTypeId: z.string().nonempty("Book Type is required!"),
  authorIds: z
    .array(z.string())
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

const validateEdits = z.object({
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
    .nullable()
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Invalid file. Choose either JPEG, JPG or PNG image."
    )
    .refine(
      (file) => !file || (file.size > 0 && file.size <= MAX_FILE_SIZE),
      "File must not be empty and must be under 10MB"
    ),
  authors: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .min(1, "At least one Author required!")
    .max(16)
    .optional(),
  genres: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .min(1, "At least one Genre required!")
    .max(16)
    .optional(),
});

export async function validateEditsAndUpdateBook(
  id: string,
  edits: EditedBook
) {
  const validationResult = validateEdits.safeParse(edits);
  if (!validationResult.success) {
    return {
      success: false,
      error:
        validationResult.error.issues[0]?.message ??
        "Please check the form for errors!",
    };
  }

  const tasks: { name: string; task: Promise<unknown> }[] = [];

  if (edits.metadata) {
    tasks.push({
      name: "Book metadata",
      task: updateBookMetadata(id, edits.metadata),
    });
  }

  if (edits.authors) {
    tasks.push({
      name: "Authors",
      task: updateBookAuthors(
        id,
        edits.authors.map((author) => author.id)
      ),
    });
  }

  if (edits.genres) {
    tasks.push({
      name: "Genres",
      task: updateBookGenres(
        id,
        edits.genres.map((genre) => genre.id)
      ),
    });
  }

  if (edits.coverImageFile !== undefined) {
    tasks.push({
      name: "Cover",
      task: updateBookCoverImage(id, edits.coverImageFile),
    });
  }

  const results = await Promise.allSettled(tasks.map((t) => t.task));

  const failedTasks = tasks.filter(
    (_, index) => results[index].status === "rejected"
  );

  if (failedTasks.length > 0) {
    const errorMessage = `Failed to update: ${failedTasks
      .map((t) => t.name)
      .join(", ")}`;

    return {
      success: false,
      error: errorMessage,
    };
  }

  return { success: true };
}
