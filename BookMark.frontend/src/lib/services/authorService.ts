import z from "zod";

export const AuthorSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(100, "Name must be at most 100 characters long"),

    biography: z
      .string()
      .max(2000, "Biography must be at most 2000 characters long")
      .refine((val: string) => val.length === 0 || val.length >= 10, {
        message: "Biography must be at least 10 characters long or empty",
      })
      .optional(),

    birthYear: z.coerce
      .number()
      .int()
      .nonnegative()
      .max(new Date().getFullYear(), "Birth year cannot be in the future")
      .optional(),

    deathYear: z.coerce
      .number()
      .int()
      .nonnegative()
      .max(new Date().getFullYear(), "Death year cannot be in the future")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.birthYear !== undefined && data.deathYear !== undefined)
      if (
        data.deathYear > 0 &&
        data.birthYear > 0 &&
        data.deathYear < data.birthYear
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Death year must be greater than or equal to birth year",
          path: ["deathYear"],
        });
      }
  });

// for some stupid reason zod drops all of the additional refinements without you explicitly doing so...
export const AuthorUpdateSchema = AuthorSchema.partial().superRefine(
  (data, ctx) => {
    if (data.birthYear !== undefined && data.deathYear !== undefined)
      if (
        data.deathYear > 0 &&
        data.birthYear > 0 &&
        data.deathYear < data.birthYear
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Death year must be greater than or equal to birth year",
          path: ["deathYear"],
        });
      }
  }
);
