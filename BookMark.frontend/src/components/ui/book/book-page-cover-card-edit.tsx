import { Book, BookUpdate } from "@/lib/types/book";
import { Card, CardContent, CardFooter } from "../card";
import { API_FILE_RESOURCES_URL } from "@/lib/services/api-calls/api";
import { BookCoverImageUpload, UploadLabel } from "./book-cover-image-upload";
import { UseFormSetValue } from "react-hook-form";

type BookFormValues = Pick<BookUpdate, "coverImageFile">;

interface BookPageCoverCardEditProps {
  book?: Book;
  setValue: UseFormSetValue<BookFormValues>;
}
export function BookPageCoverCardEdit({
  book,
  setValue,
}: BookPageCoverCardEditProps) {
  return (
    <Card className="rounded-b-lg w-full mx-auto bg-accent rounded-t-lg md:sticky md:top-36 lg:top-28 self-start text-muted hover:text-popover">
      <CardContent
        className="p-0 bg-background rounded-t-lg"
        style={{ aspectRatio: "2 / 3" }}
      >
        <BookCoverImageUpload
          value={
            book?.coverImageUrl
              ? `${API_FILE_RESOURCES_URL}${book.coverImageUrl}`
              : null
          }
          onChange={(coverImageFile) => {
            setValue("coverImageFile", coverImageFile, {
              shouldDirty: true,
            });
          }}
        />
      </CardContent>
      <CardFooter className="pb-2 flex flex-col px-4">
        <UploadLabel />
      </CardFooter>
    </Card>
  );
}
