import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BookCoverImageUpload,
  UploadLabel,
} from "@/components/ui/book/book-cover-image-upload";
import { CommonTextInput } from "@/components/ui/common/common-text-input";
import { BookAuthorInput } from "@/components/ui/book/book-author-input";
import { BookGenreEntries } from "@/components/ui/book/book-genre-entries";
import { BookAuthorEntries } from "@/components/ui/book/book-author-entries";
import { BookLanguageInput } from "@/components/ui/book/book-language-input";
import { BookPageCountInput } from "@/components/ui/book/book-page-count-input";
import { PublicationYearSelector } from "@/components/ui/book/book-publication-year-selector";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CommonSubmitButton } from "@/components/ui/common/common-submit-button";
import { GenreLinkProps } from "@/lib/types/genre";
import { AuthorLinkProps } from "@/lib/types/author";
import { BookTypePicker } from "@/components/ui/book/book-type-selector";
import { CommonDescriptionInput } from "@/components/ui/common/common-description-input";
import { BookCreate, BookType } from "@/lib/types/book";
import {
  useAllBookTypes,
  useCreateBook,
} from "@/lib/services/api-calls/hooks/useBookApi";
import { ApiError } from "@/lib/services/api-calls/api";
import { useLoading } from "@/lib/contexts/useLoading";
import { useAllGenres } from "@/lib/services/api-calls/hooks/useGenreApi";

export function AddBookPage() {
  //------------------------------------------------------------------------------
  const navigate = useNavigate();
  const { showLoadingScreen, hideLoadingScreen } = useLoading();
  const [globalFormError, setGlobalFormError] = useState<string>();
  //------------------------------------------------------------------------------
  const createBook = useCreateBook();
  //------------------------------------------------------------------------------
  const [book, setBook] = useState<BookCreate>({
    bookType: undefined!,
    title: "",
    authors: [],
    genres: [],
    originalLanguage: "",
    pageCount: 0,
    publicationYear: new Date().getFullYear(),
    description: "",
    coverImageFile: null,
  });
  //------------------------------------------------------------------------------
  const {
    data: allBookTypes,
    isFetching: areBookTypesFetching,
    error: bookTypesError,
  } = useAllBookTypes();
  const {
    data: allGenres,
    isFetching: areGenresFetching,
    error: genresError,
  } = useAllGenres();
  //------------------------------------------------------------------------------
  const fetching = areBookTypesFetching || areGenresFetching;
  const error = bookTypesError || genresError;

  useEffect(() => {
    if (fetching) showLoadingScreen();
    else hideLoadingScreen();
  }, [fetching, showLoadingScreen, hideLoadingScreen]);
  //------------------------------------------------------------------------------

  //==============================================================================
  const updateBookData = <K extends keyof BookCreate>(
    field: K,
    value: BookCreate[K]
  ) => {
    setBook((prev) => ({ ...prev, [field]: value }));
  }; //==============================================================================

  //==============================================================================
  const handleCreateBook = async () => {
    console.log(book);

    createBook.mutate(book, {
      onError: (error: ApiError) => {
        if (error.detail) setGlobalFormError(error.detail);
      },
      onSuccess: (result) => {
        navigate(`/book/${result.id}`);
      },
    });
  }; //==============================================================================

  if (error)
    return (
      <div className="text-center p-10 text-lg font-mono text-destructive">
        {error instanceof ApiError
          ? error.detail
          : "An unexpected error occurred. Reload to try again."}
      </div>
    );
  return (
    <div className="container mx-auto flex-grow">
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-[1fr_2fr] gap-5 items-start pt-4">
        <Card className="shadow-md rounded-b-lg w-full mx-auto bg-accent rounded-t-lg">
          <CardContent
            className="p-0 bg-background rounded-t-lg"
            style={{ aspectRatio: "2 / 3" }}
          >
            <BookCoverImageUpload
              onChange={(f: File | null) => updateBookData("coverImageFile", f)}
            />
          </CardContent>
          <CardFooter className="pb-2 flex flex-col px-4 pt-1">
            <UploadLabel />
          </CardFooter>
        </Card>

        {/* Book Info */}
        <div className="flex flex-col gap-5">
          <div className="w-full">
            <CommonTextInput
              placeholder="Title"
              value={book.title}
              maxLength={128}
              showCharCount
              onChange={(t: string) => updateBookData("title", t)}
            />
            <BookTypePicker
              value={book.bookType}
              allBookTypes={allBookTypes}
              onChange={(bt: BookType) => updateBookData("bookType", bt)}
            />
          </div>

          <div
            className="text-lg font-serif text-accent px-4 pt-1 -mt-3"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.074), rgba(0,0,0,0.0))",
            }}
          >
            <BookAuthorEntries
              entries={book.authors}
              onChange={(a: AuthorLinkProps[]) => updateBookData("authors", a)}
            />

            <div className="mt-2">
              <BookAuthorInput
                placeholder="Start typing to find an author"
                entries={book.authors}
                onChange={(a: AuthorLinkProps[]) =>
                  updateBookData("authors", a)
                }
              />
            </div>
          </div>

          <div className="rounded-lg border-2 border-b-4 border-accent bg-muted px-5 py-6 space-y-6">
            <BookGenreEntries
              allGenres={allGenres}
              onChange={(g: GenreLinkProps[]) => updateBookData("genres", g)}
            />

            {/* Book Metadata */}
            <div className="grid gap-y-3 text-sm font-[Verdana]">
              <PublicationYearSelector
                value={book.publicationYear}
                onChange={(py: number) => updateBookData("publicationYear", py)}
              />

              <BookPageCountInput
                value={book.pageCount}
                onChange={(pc: number) => updateBookData("pageCount", pc)}
              />

              <BookLanguageInput
                value={book.originalLanguage}
                onChange={(l: string) => updateBookData("originalLanguage", l)}
              />
            </div>
          </div>

          <CommonDescriptionInput
            value={book.description}
            onChange={(d: string) => updateBookData("description", d)}
            placeholder="Description..."
          />

          <div className="flex justify-end mb-4">
            <CommonSubmitButton
              label="Add"
              errorLabel={globalFormError}
              onClick={handleCreateBook}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
