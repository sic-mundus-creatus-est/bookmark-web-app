import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Tag } from "lucide-react";

import { GenreUpdate } from "@/lib/types/genre";
import { CommonDescription } from "@/components/ui/common/common-description";
import { CommonDescriptionInput } from "@/components/ui/common/common-description-input";
import { CommonTextInput } from "@/components/ui/common/common-text-input";
import { useForm } from "react-hook-form";
import {
  CommonErrorLabel,
  CommonSubmitButton,
} from "@/components/ui/common/common-submit-button";
import { getDirtyValues } from "@/lib/utils";
import { GenreCatalogSection } from "@/components/ui/genre/genre-catalog-section";
import { useLoading } from "@/lib/contexts/useLoading";
import {
  useDeleteGenre,
  useGenreById,
  useUpdateGenre,
} from "@/lib/services/api-calls/hooks/useGenreApi";
import { useConstrainedBooks } from "@/lib/services/api-calls/hooks/useBookApi";
import { CommonEditButton } from "@/components/ui/common/common-edit-button";
import { CommonDeleteButton } from "@/components/ui/common/common-delete-button";
import { GenreSchema } from "@/lib/services/genreService";
import { AuthorizedOnly } from "@/components/AuthorizedOnly";
import { user_roles } from "@/config/roles";

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
  } = useConstrainedBooks({
    pageIndex: 1,
    pageSize: 10,
    filters: {
      "BookType.Name==": "Book",
      "Genres.Genre.Name==": genreData?.name ?? "",
    },
  });
  const { data: genreComics } = useConstrainedBooks({
    pageIndex: 1,
    pageSize: 10,
    filters: {
      "BookType.Name==": "Comic",
      "Genres.Genre.Name==": genreData?.name ?? "",
    },
  });
  const { data: genreManga } = useConstrainedBooks({
    pageIndex: 1,
    pageSize: 10,
    filters: {
      "BookType.Name==": "Manga",
      "Genres.Genre.Name==": genreData?.name ?? "",
    },
  });
  //-------------------------------------------------------------
  const genre = useMemo(() => {
    if (!genreData) return null;

    return {
      ...genreData,
      books: genreBooks?.items,
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

    if (Object.keys(edits).length <= 0)
      return setEditFormError("You haven’t made any changes.");

    const UpdateSchema = GenreSchema.partial();

    const formDataValidation = UpdateSchema.safeParse(edits);
    if (!formDataValidation.success) {
      setEditFormError(formDataValidation.error.issues[0]?.message);
      return;
    }

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
  };

  const deleteGenre = useDeleteGenre(id);
  const handleDeleteGenre = () => {
    deleteGenre.mutate(
      { genreId: id },
      {
        onSuccess: () => {
          navigate("/home");
        },
      }
    );
  };
  //================================================================

  if (error || !genre)
    return (
      <div className="text-center p-10 text-lg font-mono text-destructive">
        Genre not found.
      </div>
    );
  return (
    <div className="my-2 font-sans text-accent">
      <AuthorizedOnly role={user_roles.admin} silent>
        <CommonEditButton
          value={editMode}
          onClick={() => setEditMode((prev) => !prev)}
        />
      </AuthorizedOnly>

      {editMode ? (
        <>
          <CommonTextInput
            fontSize={22}
            maxLength={64}
            showCharCount
            value={watch("name")}
            onChange={(newName) => {
              setValue("name", newName, { shouldDirty: true });
            }}
          />
          <div className="mt-2" />
          <CommonDescriptionInput
            value={watch("description")}
            onChange={(newDesc) => {
              setValue("description", newDesc, { shouldDirty: true });
            }}
          />
          <div className="mt-2">
            {editFormError && <CommonErrorLabel error={editFormError} />}
            <div className="flex justify-between">
              <CommonDeleteButton onClick={handleDeleteGenre} />
              <CommonSubmitButton
                label="Update"
                onClick={handleSubmit(handleUpdateGenre)}
                showCancel
                onCancel={() => setEditMode((prev) => !prev)}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <section id="genre-metadata">
            <h2 className="text-3xl font-bold">{genre.name}</h2>
            <div className="flex items-center text-sm text-accent/50 leading-tight mb-2">
              <Tag className="mr-1 w-4 h-4 text-accent" />
              <span>Genres</span>
              <span className="mx-1">›</span>
              <span className="text-popover font-semibold">{genre.name}</span>
            </div>
            <CommonDescription value={genre.description} fontSize={17} />
          </section>
          <section id="genre-catalogs">
            <GenreCatalogSection
              key={`genre-book-catalog`}
              label={`${genre.name} Books`}
              genreName={genre.name}
              bookType="book"
              books={genreBooks?.items}
            />

            <GenreCatalogSection
              key={`genre-comics-catalog`}
              label={`${genre.name} Comics`}
              genreName={genre.name}
              bookType="comic"
              books={genreComics?.items}
            />

            <GenreCatalogSection
              key={`genre-manga-catalog`}
              label={`${genre.name} Manga`}
              genreName={genre.name}
              bookType="manga"
              books={genreManga?.items}
            />
          </section>
        </>
      )}
    </div>
  );
}
