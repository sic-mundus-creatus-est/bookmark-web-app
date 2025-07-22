import { useEffect, useState } from "react";
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
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const [title, setTitle] = useState<string>("");
  const [searchedAuthor, setSearchedAuthor] = useState<string>("");
  const [bookAuthors, setBookAuthors] = useState<AuthorWithNameAndRole[]>([]);

  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [bookGenres, setBookGenres] = useState<Genre[]>([]);
  const currentYear = new Date().getFullYear();
  const [publicationYear, setPublicationYear] = useState<number>(currentYear);
  const [pageCount, setPageCount] = useState<number>(0);
  const [originalLanguage, setOriginalLanguage] = useState<string>("");

  const [description, setDescription] = useState<string>("");

  const [globalFormError, setGlobalFormError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresResponse = await getAllGenres();
        console.log(genresResponse);

        if (Array.isArray(genresResponse) && genresResponse.length > 0) {
          setAllGenres(genresResponse);
          const firstGenre = genresResponse[0];
          setBookGenres([{ id: firstGenre.id, name: firstGenre.name }]);
        }
      } catch (error: any) {
        console.error(
          `ERROR WHILE FETCHING GENRES:`,
          `\n----------------------------------`,
          `\n[${error.instance}]`,
          `\nError: ${error.status}`,
          `\n----------------------------------`,
          `\nType: ${error.type}`,
          `\nTitle: ${error.title}`,
          `\nDetail: ${error.detail}`,
          `\nTrace ID: ${error.traceId}`
        );
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    return () => {
      // to avoid memory leaks
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSelectAuthor = (author: AuthorWithNameAndRole) => {
    const name = author.name.trim();
    if (!name) return;

    const isDuplicate = author.id
      ? bookAuthors.some((a) => a.id === author.id)
      : bookAuthors.some((a) => a.name.toLowerCase() === name.toLowerCase());

    if (isDuplicate) return;

    setBookAuthors((prev) => [...prev, { id: author.id, name, roleId: 0 }]);
    setSearchedAuthor("");
  };

  const handleCreateBook = async () => {
    const authorsWithRoles: AuthorWithRole[] = bookAuthors.map((author) => ({
      authorId: author.id,
      roleId: author.roleId,
    }));
    const genreIds: string[] = bookGenres.map((g) => g.id);

    const newBookData: CreateBookParams = {
      title,
      authorsWithRoles,
      genreIds,
      publicationYear,
      pageCount,
      originalLanguage,
      description,
    };
    console.log(newBookData);
    const { success, bookId, error } = await validateAndCreateBook(newBookData);
    if (!success) return setGlobalFormError(error!);
    navigate(`/book/${bookId}`);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-4 lg:px-2 xl:px-10 2xl:px-24 flex-grow">
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-[1fr_2fr] gap-5 items-start p-4">
        <Card className="shadow-md rounded-b-lg w-full mx-auto bg-accent rounded-t-lg">
          <CardContent
            className="p-0 bg-background rounded-t-lg"
            style={{ aspectRatio: "2 / 3" }}
          >
            <BookCoverImageUpload
              coverImageFile={coverImageFile}
              setCoverImageFile={setCoverImageFile}
              setPreviewUrl={setPreviewUrl}
            />
          </CardContent>
          <CardFooter className="pb-2 flex flex-col px-4 pt-1">
            <UploadLabel />
          </CardFooter>
        </Card>

        {/* Book Info */}
        <div className="flex flex-col gap-5">
          <>
            <BookTitleInput title={title} setTitle={setTitle} />

            <div
              className="text-lg font-serif text-accent px-4 pt-1 -mt-3"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.074), rgba(0,0,0,0.0))",
              }}
            >
              <BookAuthorEntries
                bookAuthors={bookAuthors}
                handleAuthorRoleChange={(index: number, roleId: number) => {
                  setBookAuthors((prev) =>
                    prev.map((author, i) =>
                      i === index ? { ...author, roleId } : author
                    )
                  );
                }}
                handleRemoveAuthor={(index: number) => {
                  setBookAuthors((prev) => prev.filter((_, i) => i !== index));
                }}
              />

              <div className="flex items-center mt-2">
                <div className="flex-grow">
                  <BookAuthorInput
                    placeholder="Start typing to find an author"
                    inputValue={searchedAuthor}
                    selectedBookAuthors={bookAuthors}
                    onInputChange={setSearchedAuthor}
                    onAuthorSelect={handleSelectAuthor}
                    fetchAuthorSuggestions={async (query) => {
                      const result = await getConstrainedAuthors({
                        filters: { "Name~=": query },
                        pageIndex: 1,
                        pageSize: 5,
                      });
                      return result.items ?? [];
                    }}
                  />
                </div>
              </div>
            </div>
          </>

          <div className="rounded-lg border-2 border-b-4 border-accent bg-muted px-5 py-6 space-y-6">
            <BookGenreEntries
              selectedGenres={bookGenres}
              allGenres={allGenres}
              handleChangeGenre={(index: number, newGenre: Genre) => {
                setBookGenres((prev) =>
                  prev.map((genre, i) =>
                    i === index
                      ? { id: newGenre.id, name: newGenre.name }
                      : genre
                  )
                );
              }}
              handleRemoveGenre={(index: number) => {
                if (bookGenres.length > 1)
                  setBookGenres(bookGenres.filter((_, i) => i !== index));
              }}
              handleAddGenre={() => {
                const firstUnselected = allGenres.find(
                  (g) => !bookGenres.some((bg) => bg.id === g.id)
                );

                if (firstUnselected) {
                  setBookGenres([
                    ...bookGenres,
                    { id: firstUnselected.id, name: firstUnselected.name },
                  ]);
                }
              }}
            />

            {/* Book Metadata */}
            <div className="grid gap-y-3 text-sm font-[Verdana]">
              <PublicationYearSelector
                publicationYear={publicationYear}
                setPublicationYear={setPublicationYear}
              />

              <BookPageCountInput
                pageCount={pageCount}
                setPageCount={setPageCount}
              />

              <BookLanguageInput
                language={originalLanguage}
                setLanguage={setOriginalLanguage}
              />
            </div>
          </div>

          <BookDescriptionInput
            description={description}
            setDescription={setDescription}
          />

          <div className="flex flex-col items-end">
            {globalFormError && (
              <div className="text-red-500 font-mono italic font-bold text-sm mb-1 text-right -mt-2">
                {globalFormError}
              </div>
            )}
            <AddButton label="Add" onClick={handleCreateBook} />
          </div>
        </div>
      </div>
    </div>
  );
}
