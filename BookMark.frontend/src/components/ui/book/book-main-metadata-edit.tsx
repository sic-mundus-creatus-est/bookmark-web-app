import { BookType, BookUpdate } from "@/lib/types/book";
import { CommonTextInput } from "../common/common-text-input";
import { BookTypePicker } from "./book-type-selector";
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { BookAuthorEntries } from "./book-author-entries";
import { BookAuthorInput } from "./book-author-input";

type BookFormValues = Pick<BookUpdate, "title" | "bookType" | "authors">;

interface BookMainMetadataEditProps {
  allBookTypes?: BookType[];
  watch: UseFormWatch<BookFormValues>;
  setValue: UseFormSetValue<BookFormValues>;
}
export function BookMainMetadataEdit({
  allBookTypes,
  watch,
  setValue,
}: BookMainMetadataEditProps) {
  return (
    <div className="w-full">
      <>
        <CommonTextInput
          value={watch("title")}
          onChange={(newTitle) => {
            setValue("title", newTitle, { shouldDirty: true });
          }}
          maxLength={128}
          showCharCount
        />
        <BookTypePicker
          value={watch("bookType")}
          allBookTypes={allBookTypes}
          onChange={(newBookType) => {
            setValue("bookType", newBookType, {
              shouldDirty: true,
            });
          }}
        />
      </>
      <div
        className="text-lg font-serif text-accent pl-4 px-1 pt-2 mt-0.5"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.074), rgba(0,0,0,0.0))",
        }}
      >
        <>
          <BookAuthorEntries
            entries={watch("authors")}
            onChange={(updatedAuthors) => {
              setValue("authors", [...updatedAuthors], {
                shouldDirty: true,
              });
            }}
          />
          <div className="mt-2">
            <BookAuthorInput
              placeholder="Start typing to find an author"
              entries={watch("authors")}
              onChange={(updatedAuthors) => {
                setValue("authors", updatedAuthors, {
                  shouldDirty: true,
                });
              }}
            />
          </div>
        </>
      </div>
    </div>
  );
}
