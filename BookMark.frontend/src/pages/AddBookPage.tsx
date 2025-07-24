import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BookCoverImageUpload,
  UploadLabel,
} from "@/components/ui/book/book-cover-image-upload";
import { getAllGenres } from "@/lib/services/api-calls/genreService";
import { BookTitleInput } from "@/components/ui/book/book-title-input";
import { BookAuthorInput } from "@/components/ui/book/book-author-input";
import { BookGenreEntries } from "@/components/ui/book/book-genre-entries";
import { AuthorWithNameAndRole, AuthorWithRole } from "@/lib/types/author";
import { BookAuthorEntries } from "@/components/ui/book/book-author-entries";
import { BookLanguageInput } from "@/components/ui/book/book-language-input";
import { getConstrainedAuthors } from "@/lib/services/api-calls/authorService";
import { BookPageCountInput } from "@/components/ui/book/book-page-count-input";
import { BookDescriptionInput } from "@/components/ui/book/book-description-input";
import { PublicationYearSelector } from "@/components/ui/book/book-publication-year-selector";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { validateAndCreateBook } from "@/lib/services/bookService";
import { AddButton } from "@/components/ui/add-button";
import { CreateBookParams } from "@/lib/types/book";
import { Genre } from "@/lib/types/genre";

export function AddBookPage() {
  //------------------------------------------------------------------------------
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  const [title, setTitle] = useState<string>("");
  const [selectedAuthors, setSelectedAuthors] = useState<
    AuthorWithNameAndRole[]
  >([]);

  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
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
    const authorsWithRoles: AuthorWithRole[] = selectedAuthors.map(
      (author) => ({
        authorId: author.id,
        roleId: author.roleId,
      })
    );
    const genreIds: string[] = selectedGenres.map((g) => g.id);

    const newBookData: CreateBookParams = {
      title,
      authorsWithRoles,
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
    <div className="container mx-auto px-4 sm:px-6 md:px-4 lg:px-2 xl:px-10 2xl:px-24 flex-grow">
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-[1fr_2fr] gap-5 items-start p-4">
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
          <BookTitleInput onChange={setTitle} />

          <div
            className="text-lg font-serif text-accent px-4 pt-1 -mt-3"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.074), rgba(0,0,0,0.0))",
            }}
          >
            <BookAuthorEntries
              authors={selectedAuthors}
              onChange={setSelectedAuthors}
            />

            <div className="mt-2">
              <BookAuthorInput
                placeholder="Start typing to find an author"
                fetchAuthorSuggestions={async (query) => {
                  const result = await getConstrainedAuthors({
                    filters: { "Name~=": query },
                    pageIndex: 1,
                    pageSize: 5,
                  });
                  return result.items ?? [];
                }}
                selectedAuthors={selectedAuthors}
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
              <PublicationYearSelector onChange={setPublicationYear} />

              <BookPageCountInput onChange={setPageCount} />

              <BookLanguageInput onChange={setOriginalLanguage} />
            </div>
          </div>

          <BookDescriptionInput onChange={setDescription} />

          <AddButton
            label="Add"
            errorLabel={globalFormError}
            onClick={handleCreateBook}
          />
        </div>
      </div>
    </div>
  );
}
