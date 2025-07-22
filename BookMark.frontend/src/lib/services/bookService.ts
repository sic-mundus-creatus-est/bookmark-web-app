import { z } from "zod";
import { Book, CreateBookParams } from "../types/book";
import { createBook } from "./api-calls/bookService";

const bookSchema = z.object({
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
});

export async function validateAndCreateBook(data: CreateBookParams) {
  console.log("Validating data:", data);
  const validationResult = bookSchema.safeParse(data);
  if (!validationResult.success) {
    return {
      success: false,
      error:
        validationResult.error.issues[0]?.message ??
        "Please check the form for errors!",
    };
  }

  const result: Book = await createBook(data);
  return { success: true, bookId: result.id };
}
