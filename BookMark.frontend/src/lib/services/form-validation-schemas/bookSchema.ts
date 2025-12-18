import { z } from "zod";

// Schemas for nested types
const createSelectionSchema = (invalidMessage: string) =>
  z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
    })
    .superRefine(
      (obj: { id?: string; name?: string }, ctx: z.RefinementCtx) => {
        if (!obj.id || !obj.name) {
          ctx.addIssue({
            code: "custom",
            message: obj.name
              ? `${invalidMessage}: "${obj.name}"`
              : invalidMessage,
          });
        }
      }
    );

export const BookTypeSchema = createSelectionSchema(
  "Please select a valid book type."
);
export const AuthorLinkPropsSchema = createSelectionSchema("Invalid author(s)");
export const GenreLinkPropsSchema = createSelectionSchema("Invalid genre(s)");

export const BookSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Title must be at least 2 characters long." })
    .max(128, { message: "Title must not exceed 128 characters." }),

  bookType: BookTypeSchema,

  authors: z
    .array(AuthorLinkPropsSchema)
    .min(1, { message: "At least one author is required." })
    .max(16, { message: "You can specify up to 16 authors only." }),

  genres: z
    .array(GenreLinkPropsSchema)
    .min(1, { message: "At least one genre is required." })
    .max(16, { message: "You can specify up to 16 genres only." }),

  publicationYear: z
    .number()
    .min(1000, { message: "Publication year must be after 1000." })
    .max(new Date().getFullYear(), {
      message: "Publication year cannot be in the future.",
    }),

  pageCount: z
    .number()
    .min(1, { message: "Page count must be at least 1." })
    .max(10000, {
      message: "Most books do not exceed nor come close 10,000 pages.",
    }),

  originalLanguage: z
    .string()
    .min(2, { message: "Language must be at least 2 characters long." })
    .max(64, { message: "Language must not exceed 64 characters." }),

  description: z
    .string()
    .max(2000, { message: "Description must not exceed 4000 characters." })
    .refine((val: string) => val.length === 0 || val.length >= 10, {
      message: "Description must be at least 10 characters long or empty",
    })
    .optional(),

  coverImageFile: z
    .instanceof(File)
    .refine((file: File) => file.size <= 10 * 1024 * 1024, {
      message: "Cover image must be under 10MB.",
    })
    .refine(
      (file: File) =>
        ["image/jpeg", "image/jpg", "image/png"].includes(file.type),
      { message: "Cover image must be a JPG, JPEG, or PNG file." }
    )
    .nullable()
    .optional(),
});
