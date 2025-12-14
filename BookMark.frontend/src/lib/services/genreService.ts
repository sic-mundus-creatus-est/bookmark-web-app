import z from "zod";

export const GenreSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(64, "Name must be at most 64 characters long"),
  description: z
    .string()
    .max(4000, "Description must be at most 4000 characters long")
    .refine((val: string) => val.length === 0 || val.length >= 10, {
      message: "Description must be at least 10 characters long or empty",
    })
    .optional(),
});
