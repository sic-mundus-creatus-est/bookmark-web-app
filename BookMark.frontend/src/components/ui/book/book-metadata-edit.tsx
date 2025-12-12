import React from "react";
import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { BookGenreEntries } from "./book-genre-entries";
import { GenreLinkProps } from "@/lib/types/genre";
import { PublicationYearSelector } from "./book-publication-year-selector";
import { BookPageCountInput } from "./book-page-count-input";
import { BookLanguageInput } from "./book-language-input";
import { BookUpdate } from "@/lib/types/book";

type BookFormValues = Pick<
  BookUpdate,
  "genres" | "publicationYear" | "pageCount" | "originalLanguage"
>;

interface BookMetadataEditFormProps {
  watch: UseFormWatch<BookFormValues>;
  setValue: UseFormSetValue<BookFormValues>;
  allGenres?: GenreLinkProps[];
}
export const BookMetadataEditForm: React.FC<BookMetadataEditFormProps> = ({
  watch,
  setValue,
  allGenres,
}) => {
  return (
    <div className="rounded-lg border-2 border-b-4 border-accent bg-muted px-2 sm:px-4 py-6 space-y-6">
      {/* Genres */}
      <BookGenreEntries
        initialGenres={watch("genres")}
        allGenres={allGenres}
        onChange={(updatedGenres) => {
          setValue("genres", [...updatedGenres], { shouldDirty: true });
        }}
      />

      {/* Book Metadata */}
      <div className="grid gap-y-3 text-sm font-[Verdana]">
        <PublicationYearSelector
          value={watch("publicationYear")}
          onChange={(year) =>
            setValue("publicationYear", year, { shouldDirty: true })
          }
        />

        <BookPageCountInput
          value={watch("pageCount")}
          onChange={(newCount) =>
            setValue("pageCount", newCount, { shouldDirty: true })
          }
        />

        <BookLanguageInput
          value={watch("originalLanguage")}
          onChange={(language) =>
            setValue("originalLanguage", language, { shouldDirty: true })
          }
        />
      </div>
    </div>
  );
};
