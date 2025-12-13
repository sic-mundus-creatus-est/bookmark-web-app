import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { CircleUserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BookShowcase } from "@/components/layouts/book-showcase";
import { AuthorUpdate } from "@/lib/types/author";
import { CommonDescription } from "@/components/ui/common/common-description";
import { CommonSubmitButton } from "@/components/ui/common/common-submit-button";
import { CommonTextInput } from "@/components/ui/common/common-text-input";
import { CommonDescriptionInput } from "@/components/ui/common/common-description-input";
import { AuthorLifeRangeInput } from "@/components/ui/author/author-life-range-input";
import { useForm } from "react-hook-form";
import { getDirtyValues } from "@/lib/utils";
import { useLoading } from "@/lib/contexts/useLoading";
import {
  useAuthor,
  useDeleteAuthor,
  useUpdateAuthor,
} from "@/lib/services/api-calls/hooks/useAuthorApi";
import { useGenresByAuthor } from "@/lib/services/api-calls/hooks/useGenreApi";
import { useConstrainedBooks } from "@/lib/services/api-calls/hooks/useBookApi";
import { CommonEditButton } from "@/components/ui/common/common-edit-button";
import { CommonDeleteButton } from "@/components/ui/common/common-delete-button";

export function AuthorPage() {
  //--------------------------------------------------------------------------
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };
  //--------------------------------------------------------------------------
  const { showLoadingScreen, hideLoadingScreen } = useLoading();
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editFormError, setEditFormError] = useState<string>();
  //--------------------------------------------------------------------------
  const updateAuthor = useUpdateAuthor();
  //--------------------------------------------------------------------------
  const {
    data: authorData,
    isFetching: isAuthorFetching,
    error: authorError,
  } = useAuthor(id);
  const {
    data: genres,
    isFetching: areGenresFetching,
    error: genresError,
  } = useGenresByAuthor(id);
  const {
    data: authorBooks,
    isFetching: areBooksFetching,
    error: booksError,
  } = useConstrainedBooks({
    pageIndex: 1,
    pageSize: 10,
    filters: {
      "Authors.Author.Name==": authorData?.name ?? "",
    },
  });

  //--------------------------------------------------------------------------
  const author = useMemo(() => {
    if (!authorData) return null;

    return {
      ...authorData,
      genres: genres,
      books: authorBooks,
    };
  }, [authorData, genres, authorBooks]);
  //--------------------------------------------------------------------------
  const {
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { dirtyFields },
  } = useForm<AuthorUpdate>();
  //--------------------------------------------------------------------------
  useEffect(() => {
    if (!id) {
      navigate("/");
    }
  }, [id, navigate]);

  useEffect(() => {
    if (editMode && author) {
      reset({ ...(({ id: _id, ...rest }) => rest)(author) });
    } else if (!editMode) {
      reset();
      setEditFormError(undefined);
    }
  }, [editMode, author, reset]);
  //--------------------------------------------------------------------------
  const fetching = isAuthorFetching || areGenresFetching || areBooksFetching;
  const error = authorError || genresError || booksError;

  useEffect(() => {
    if (fetching) showLoadingScreen();
    else hideLoadingScreen();
  }, [fetching, showLoadingScreen, hideLoadingScreen]);
  //--------------------------------------------------------------------------

  //==============================================================================
  const handleUpdateAuthor = async (allFields: AuthorUpdate) => {
    if (!author) return;

    let edits = getDirtyValues(allFields, dirtyFields);

    if (dirtyFields.birthYear || dirtyFields.deathYear) {
      edits = {
        ...edits,
        birthYear: allFields.birthYear,
        deathYear: allFields.deathYear,
      };
    }

    console.log(edits);

    if (Object.keys(edits).length <= 0)
      return setEditFormError("You haven’t made any changes.");

    updateAuthor.mutate(
      { id: author.id, data: edits },
      {
        onError: (error: any) => {
          setEditFormError(error?.message || "Failed to update author");
        },
        onSuccess: () => {
          setEditMode(false);
        },
      }
    );
  };

  const deleteAuthor = useDeleteAuthor(id);
  const handleDeleteAuthor = () => {
    deleteAuthor.mutate(
      { authorId: id },
      {
        onSuccess: () => {
          navigate("/home");
        },
      }
    );
  };
  //==============================================================================

  if (error || !author)
    return (
      <div className="text-center p-10 text-lg font-mono text-popover">
        Author not found.
      </div>
    );
  return (
    <div className="flex-grow max-w-full container mx-auto sm:px-16 lg:px-24 xl:px-32 my-4 sm:mt-10">
      <CommonEditButton
        value={editMode}
        onClick={() => setEditMode((prev) => !prev)}
      />
      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 text-accent justify-center">
        <div className="flex-shrink-0 flex flex-col items-center">
          <CircleUserRound
            size={100}
            strokeWidth={1}
            className="text-accent w-20 h-20 sm:w-auto sm:h-auto"
          />
          <span className="font-extrabold font-mono text-xl -mt-2">Author</span>
        </div>
        <div className="w-full">
          {editMode ? (
            <>
              <CommonTextInput
                fontSize={28}
                maxLength={64}
                showCharCount
                placeholder="Name"
                value={watch("name")}
                onChange={(newName) => {
                  setValue("name", newName, { shouldDirty: true });
                }}
              />
              <div className="flex-shrink-0 flex justify-center sm:block">
                <AuthorLifeRangeInput
                  birthYear={watch("birthYear")}
                  deathYear={watch("deathYear")}
                  onChange={({ birthYear, deathYear }) => {
                    setValue("birthYear", birthYear, { shouldDirty: true });
                    setValue("deathYear", deathYear, { shouldDirty: true });
                  }}
                />
              </div>
              <CommonDescriptionInput
                placeholder="Biography..."
                value={watch("biography")}
                onChange={(newBiography) => {
                  setValue("biography", newBiography, { shouldDirty: true });
                }}
              />
              <div className="flex justify-between mt-2">
                <CommonDeleteButton onClick={handleDeleteAuthor} />
                <CommonSubmitButton
                  label="Update"
                  onClick={handleSubmit(handleUpdateAuthor)}
                  showCancel
                  onCancel={() => setEditMode((prev) => !prev)}
                  errorLabel={editFormError}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex-shrink-0 flex justify-center sm:block -mt-4 sm:mt-0">
                <h2 className="text-4xl font-semibold font-[Verdana] text-center sm:text-start">
                  {author.name}
                </h2>
              </div>
              <div className="flex-shrink-0 flex justify-center sm:block">
                <span className="text-muted-foreground mb-2 sm:ml-2 font-[Georgia] text-xl">
                  ({author.birthYear != 0 && <time>{author.birthYear}</time>} –{" "}
                  {author.deathYear != 0 && <time>{author.deathYear}</time>})
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap mb-3 justify-center sm:justify-start">
                {author.genres?.map((genre) => (
                  <Link to={`/genre/${genre.id}`} key={genre.id}>
                    <Badge
                      key={`${genre.id}`}
                      className="rounded-full px-3 py-1 text-xs tracking-wide bg-accent text-background font-bold font-[Helvetica] hover:bg-accent hover:text-popover"
                    >
                      {genre.name}
                    </Badge>
                  </Link>
                ))}
              </div>
              <CommonDescription placeholder="" value={author.biography} />
            </>
          )}
        </div>
      </div>

      {!editMode && (
        <div className="mb-4 mt-4">
          <h2 className="text-accent text-center text-3xl italic pb-1 font-[Candara] font-bold">
            From This Author:
          </h2>
          <div className="w-full flex justify-center flex-1 min-w-0">
            <BookShowcase books={author.books?.items} />
          </div>

          <Link
            to={`/all?author=${encodeURIComponent(author.name)}`}
            className="flex justify-end font-bold italic font-[Candara] text-xl hover:text-popover cursor-pointer mr-4 mt-2"
          >
            ...see more
          </Link>
        </div>
      )}
    </div>
  );
}
