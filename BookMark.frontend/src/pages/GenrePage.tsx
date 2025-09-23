import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { SquarePen, Tag, X } from "lucide-react";

import { GenreUpdate, Genre } from "@/lib/types/genre";
import { CommonDescription } from "@/components/ui/common/common-description";
import { CommonDescriptionInput } from "@/components/ui/common/common-description-input";
import { CommonTextInput } from "@/components/ui/common/common-text-input-field";
import { useForm } from "react-hook-form";
import { CommonSubmitButton } from "@/components/ui/common/common-submit-button";
import { getDirtyValues } from "@/lib/utils";
import { GenreCatalogSection } from "@/components/ui/genre/genre-catalog-section";
import { useLoading } from "@/lib/contexts/useLoading";
import {
  useGenreById,
  useUpdateGenre,
} from "@/lib/services/api-calls/hooks/useGenreApi";
import { useBooksInGenre } from "@/lib/services/api-calls/hooks/useBookApi";

export function GenrePage() {
  //-------------------------------------------------------------
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };
  //-------------------------------------------------------------
  const { showLoadingScreen, hideLoadingScreen } = useLoading();
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editFormError, setEditFormError] = useState<string>();
  //-------------------------------------------------------------
  const updateGenre = useUpdateGenre();
  //-------------------------------------------------------------
  const {
    data: genreData,
    isFetching: isGenreFetching,
    error: genreError,
  } = useGenreById(id);
  const {
    data: genreBooks,
    isFetching: areGenreBooksFetching,
    error: genreBooksError,
  } = useBooksInGenre(id);
  //-------------------------------------------------------------
  const genre = useMemo<Genre | null>(() => {
    if (!genreData) return null;

    return {
      ...genreData,
      books: genreBooks,
    };
  }, [genreData, genreBooks]);
  //-------------------------------------------------------------
  const {
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { dirtyFields },
  } = useForm<GenreUpdate>();
  //-------------------------------------------------------------
  useEffect(() => {
    if (!id) {
      navigate("/");
    }
  }, [id, navigate]);
  //-------------------------------------------------------------
  const fetching = isGenreFetching || areGenreBooksFetching;
  const error = genreError || genreBooksError;

  useEffect(() => {
    if (fetching) showLoadingScreen();
    else hideLoadingScreen();
  }, [fetching, showLoadingScreen, hideLoadingScreen]);
  //-------------------------------------------------------------
  useEffect(() => {
    if (editMode && genre) {
      reset({ ...(({ id: _id, ...rest }) => rest)(genre) });
    } else if (!editMode) {
      reset();
      setEditFormError(undefined);
    }
  }, [editMode, genre, reset]);
  //-------------------------------------------------------------

  //================================================================
  const handleUpdateGenre = async (allFields: GenreUpdate) => {
    const edits = getDirtyValues(allFields, dirtyFields);

    console.log(edits);

    if (Object.keys(edits).length <= 0)
      return setEditFormError("You haven’t made any changes.");

    updateGenre.mutate(
      { id: id, data: edits },
      {
        onError: (error: any) => {
          setEditFormError(error?.message || "Failed to update genre");
        },
        onSuccess: () => {
          setEditMode(false);
        },
      }
    );
  }; //================================================================

  if (error || !genre)
    return (
      <div className="text-center p-10 text-lg font-mono text-destructive">
        Genre not found.
      </div>
    );
  return (
    <div className="my-2 font-sans text-accent">
      <div className="flex justify-end mx-0 md:mx-2 pt-2">
        <button
          title={editMode ? "Cancel Editing" : "Edit"}
          onClick={() => setEditMode((prev) => !prev)}
          className="text-accent hover:text-popover"
        >
          {editMode ? (
            <X size={24} strokeWidth={5} />
          ) : (
            <SquarePen size={24} strokeWidth={3} />
          )}
        </button>
      </div>

      <section id="genre-metadata">
        {editMode ? (
          <CommonTextInput
            value={watch("name")}
            onChange={(newName) => {
              setValue("name", newName, { shouldDirty: true });
            }}
          />
        ) : null}
        <div className="flex items-center text-sm text-accent/50 leading-tight mb-2">
          <Tag className="mr-1 w-4 h-4 text-accent" />
          <span className="hover:underline cursor-pointer">Genres</span>
          <span className="mx-1">›</span>
          <span className="text-popover font-semibold">
            {editMode ? watch("name") : genre.name}
          </span>
        </div>
        {editMode ? (
          <CommonDescriptionInput
            value={watch("description")}
            onChange={(newDesc) => {
              setValue("description", newDesc, { shouldDirty: true });
            }}
          />
        ) : (
          <CommonDescription value={genre.description} />
        )}
      </section>

      {editMode ? null : (
        <section id="genre-catalogs">
          <GenreCatalogSection
            name={genre.name}
            type="Books"
            books={genre.books}
            review="Random featured review or message..."
          />

          <GenreCatalogSection
            name={genre.name}
            type="Comics"
            books={genre.books}
            review="Another cool review or message..."
            reverse
          />

          <GenreCatalogSection
            name={genre.name}
            type="Manga"
            books={genre.books}
            review="Reviews or insights text here."
          />
        </section>
      )}

      {editMode ? (
        <div className="flex justify-end mt-2">
          <CommonSubmitButton
            label="Update"
            onClick={handleSubmit(handleUpdateGenre)}
            showCancel
            onCancel={() => setEditMode((prev) => !prev)}
            errorLabel={editFormError}
          />
        </div>
      ) : null}
    </div>
  );
}
