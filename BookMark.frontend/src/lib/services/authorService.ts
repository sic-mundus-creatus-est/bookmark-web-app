import z from "zod";

import {
  getConstrainedAuthors,
  updateAuthor,
} from "@/lib/services/api-calls/authorApi";
import { EditedAuthor } from "@/lib/types/author";

const currentYear = new Date().getFullYear();

const validateEdits = z
  .object({
    name: z
      .string()
      .max(64, "Name must be at most 64 characters long!")
      .optional()
      .refine(
        (val) => val === undefined || val.trim() !== "",
        "Name is required!"
      ),
    biography: z
      .string()
      .max(4000, "Biography must be at most 4000 characters long!")
      .optional(),
    birthYear: z.number().min(0).max(currentYear).optional(),
    deathYear: z.number().min(0).max(currentYear).optional(),
  })
  .refine(
    (data) => {
      if (!data.birthYear && !data.deathYear) return true;
      if (data.birthYear && !data.deathYear) return true;
      if (data.birthYear && data.deathYear) {
        return data.deathYear >= data.birthYear;
      }
    },
    {
      message: "Death year must come after birth year is set.",
    }
  );

export async function validateEditsAndUpdateAuthor(
  id: string,
  edits: EditedAuthor
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

  try {
    await updateAuthor(id, edits);
    return { success: true };
  } catch (err) {
    console.error("Failed to update author: ", err);
    return {
      success: false,
      error:
        "An unexpected error occurred while updating the author. Try again.",
    };
  }
}

export async function authorInputSuggestions(searchTerm: string) {
  const result = await getConstrainedAuthors({
    filters: { "Name~=": searchTerm },
    pageIndex: 1,
    pageSize: 5,
  });
  return result.items ?? [];
}
