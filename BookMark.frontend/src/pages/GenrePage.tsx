import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { SquarePen, Tag, X } from "lucide-react";

import { getGenreById } from "@/lib/services/api-calls/genreApi";
import { EditedGenre, Genre } from "@/lib/types/genre";
import { getBooksInGenre } from "@/lib/services/api-calls/bookApi";
import { CommonDescription } from "@/components/ui/common/common-description";
import { CommonDescriptionInput } from "@/components/ui/common/common-description-input";
import { CommonTextInputField } from "@/components/ui/common/common-text-input-field";
import { useForm } from "react-hook-form";
import { CommonSubmitButton } from "@/components/ui/common/common-submit-button";
import { getDirtyValues } from "@/lib/utils";
import { validateEditsAndUpdateGenre } from "@/lib/services/genreService";
import { GenreCatalogSection } from "@/components/ui/genre/genre-catalog-section";

export function GenrePage() {
  //-------------------------------------------------------
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editFormError, setEditFormError] = useState<string | null>(null);

  //-------------------------------------------------------
  const [genre, setGenre] = useState<Genre | null>(null);
  //-------------------------------------------------------

  //-------------------------------------------------------
  const {
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { dirtyFields },
  } = useForm<EditedGenre>();

  useEffect(() => {
    if (editMode && genre) {
      reset(genre);
    } else if (!editMode) {
      reset();
      setEditFormError(null);
    }
  }, [editMode, genre, reset]);
  //-------------------------------------------------------

  //==============================================================================
  useEffect(() => {
    async function fetchGenre() {
      try {
        setLoading(true);
        setError(false);

        if (!id) throw new Error("No author ID provided");

        const [data, books] = await Promise.all([
          await getGenreById(id),
          await getBooksInGenre(id, 10),
        ]);

        setGenre({ ...data, books });
      } catch (e) {
        console.error("Error fetching book:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchGenre();
  }, [id]);

  const handleUpdateGenre = async (allFields: EditedGenre) => {
    if (!genre) return;

    const edits = getDirtyValues(allFields, dirtyFields);

    console.log(edits);

    if (Object.keys(edits).length <= 0)
      return setEditFormError("You haven’t made any changes.");

    const { success, error } = await validateEditsAndUpdateGenre(
      genre.id,
      edits
    );

    if (!success) return setEditFormError(error!);

    const updatedGenre = await getGenreById(id!);
    setGenre({ ...genre, ...updatedGenre });

    setEditMode(false);
  };
  //==============================================================================

  //==============================================================================
  if (loading) {
    return (
      <div className="text-center p-10 text-lg font-mono text-muted-foreground">
        Loading genre...
      </div>
    );
  }
  //-----------------------------------------------------
  if (error || !genre) {
    return (
      <div className="text-center p-10 text-lg font-mono text-destructive">
        Genre not found.
      </div>
    );
  }
  //==============================================================================

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
          <CommonTextInputField
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
