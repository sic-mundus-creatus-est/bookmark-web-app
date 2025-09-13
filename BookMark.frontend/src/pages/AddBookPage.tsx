import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BookCoverImageUpload,
  UploadLabel,
} from "@/components/ui/book/book-cover-image-upload";
import { getAllGenres } from "@/lib/services/api-calls/genreApi";
import { CommonTextInputField } from "@/components/ui/common/common-text-input-field";
import { BookAuthorInput } from "@/components/ui/book/book-author-input";
import { BookGenreEntries } from "@/components/ui/book/book-genre-entries";
import { BookAuthorEntries } from "@/components/ui/book/book-author-entries";
import { BookLanguageInput } from "@/components/ui/book/book-language-input";
import { BookPageCountInput } from "@/components/ui/book/book-page-count-input";
import { PublicationYearSelector } from "@/components/ui/book/book-publication-year-selector";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { validateAndCreateBook } from "@/lib/services/bookService";
import { CommonSubmitButton } from "@/components/ui/common/common-submit-button";
import { GenreLinkProps } from "@/lib/types/genre";
import { authorInputSuggestions } from "@/lib/services/authorService";
import { AuthorLinkProps } from "@/lib/types/author";
import { CreateBookParams } from "@/lib/services/api-calls/bookApi";
import { BookTypePicker } from "@/components/ui/book/book-type-selector";
import { CommonDescriptionInput } from "@/components/ui/common/common-description-input";

export function AddBookPage() {
  //------------------------------------------------------------------------------
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  const [bookTypeId, setBookTypeId] = useState<string>("");

  const [title, setTitle] = useState<string>("");
  const [selectedAuthors, setSelectedAuthors] = useState<AuthorLinkProps[]>([]);

  const [selectedGenres, setSelectedGenres] = useState<GenreLinkProps[]>([]);
  const [publicationYear, setPublicationYear] = useState<number>();
  const [pageCount, setPageCount] = useState<number>(0);
  const [originalLanguage, setOriginalLanguage] = useState<string>("");

  const [description, setDescription] = useState<string>("");

  const [globalFormError, setGlobalFormError] = useState<string | null>(null);
  //------------------------------------------------------------------------------

  //------------------------------------------------------------------------------
  const navigate = useNavigate();
  //------------------------------------------------------------------------------

  //==============================================================================
  const handleCreateBook = async () => {
    const authorIds: string[] = selectedAuthors.map((sa) => sa.id);
    const genreIds: string[] = selectedGenres.map((sg) => sg.id);

    const newBookData: CreateBookParams = {
      bookTypeId,
      title,
      authorIds,
      genreIds,
      publicationYear,
      pageCount,
      originalLanguage,
      description,
      coverImageFile: coverImageFile || undefined,
    };
    console.log(newBookData);
    const { success, bookId, error } = await validateAndCreateBook(newBookData);

    if (!success) return setGlobalFormError(error!);
    navigate(`/book/${bookId}`);
  };
  //==============================================================================

  return (
    <div className="container mx-auto flex-grow">
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-[1fr_2fr] gap-5 items-start pt-4">
        <Card className="shadow-md rounded-b-lg w-full mx-auto bg-accent rounded-t-lg">
          <CardContent
            className="p-0 bg-background rounded-t-lg"
            style={{ aspectRatio: "2 / 3" }}
          >
            <BookCoverImageUpload onChange={setCoverImageFile} />
          </CardContent>
          <CardFooter className="pb-2 flex flex-col px-4 pt-1">
            <UploadLabel />
          </CardFooter>
        </Card>

        {/* Book Info */}
        <div className="flex flex-col gap-5">
          <div className="w-full">
            <CommonTextInputField
              placeholder="Title"
              value={title}
              maxLength={128}
              showCharCount
              onChange={setTitle}
            />
            <BookTypePicker
              value={bookTypeId}
              onChange={(bt) => {
                setBookTypeId(bt.id);
              }}
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
              entries={selectedAuthors}
              onChange={setSelectedAuthors}
            />

            <div className="mt-2">
              <BookAuthorInput
                placeholder="Start typing to find an author"
                fetchSuggestions={authorInputSuggestions}
                entries={selectedAuthors}
                onChange={setSelectedAuthors}
              />
            </div>
          </div>

          <div className="rounded-lg border-2 border-b-4 border-accent bg-muted px-5 py-6 space-y-6">
            <BookGenreEntries
              fetchAllGenres={getAllGenres}
              onChange={(updatedGenres) => setSelectedGenres(updatedGenres)}
            />

            {/* Book Metadata */}
            <div className="grid gap-y-3 text-sm font-[Verdana]">
              <PublicationYearSelector
                value={publicationYear}
                onChange={setPublicationYear}
              />

              <BookPageCountInput value={pageCount} onChange={setPageCount} />

              <BookLanguageInput
                value={originalLanguage}
                onChange={setOriginalLanguage}
              />
            </div>
          </div>

          <CommonDescriptionInput
            value={description}
            onChange={setDescription}
            placeholder="Description..."
          />

          <div className="flex justify-end">
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
