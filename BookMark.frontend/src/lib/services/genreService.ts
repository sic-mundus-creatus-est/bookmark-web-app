// import z from "zod";

// import { GenreUpdate } from "@/lib/types/genre";
// import { updateGenre } from "@/lib/services/api-calls/genreApi";

// const validateEdits = z.object({
//   name: z
//     .string()
//     .max(64, "Name must be at most 64 characters long!")
//     .optional()
//     .refine(
//       (val) => val === undefined || val.trim() !== "",
//       "Name is required!"
//     ),
//   description: z
//     .string()
//     .max(4000, "Description must be at most 4000 characters long!")
//     .optional(),
// });
// export async function validateEditsAndUpdateGenre(
//   id: string,
//   edits: GenreUpdate
// ) {
//   const validationResult = validateEdits.safeParse(edits);
//   if (!validationResult.success) {
//     return {
//       success: false,
//       error:
//         validationResult.error.issues[0]?.message ??
//         "Please check the form for errors!",
//     };
//   }

//   try {
//     await updateGenre(id, edits);
//     return { success: true };
//   } catch (err) {
//     console.error("Failed to update genre: ", err);
//     return {
//       success: false,
//       error:
//         "An unexpected error occurred while updating the genre. Try again.",
//     };
//   }
// }
