import { SquarePen, Tag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { BookShowcase } from "@/components/layouts/book-showcase";
import { getGenreById } from "@/lib/services/api-calls/genreApi";
import { Genre } from "@/lib/types/genre";
import { Book } from "@/lib/types/book";
import { getBooksInGenre } from "@/lib/services/api-calls/bookApi";
import { CommonDescription } from "@/components/ui/common/common-description";

export function GenrePage() {
  //-------------------------------------------------------
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);

  const [genre, setGenre] = useState<Genre | null>(null);
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
  //-----------------------------------------------------
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
      <div className="flex justify-end mx-0 md:mx-2 pt-2 -mb-6">
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
        <div className="flex items-center text-sm text-accent/50 leading-tight mb-2">
          <Tag className="mr-1 w-4 h-4 text-accent" />
          <span className="hover:underline cursor-pointer">Genres</span>
          <span className="mx-1">›</span>
          <span className="text-popover font-semibold">{genre.name}</span>
        </div>
        <CommonDescription description={genre.description} />
      </section>

      {editMode ? null : (
        <section id="genre-catalogs">
          <GenreCatalogSection
            genreName={genre.name}
            sectionType="Books"
            books={genre.books}
            message="Random featured review or message..."
          />

          <GenreCatalogSection
            genreName={genre.name}
            sectionType="Comics"
            books={genre.books}
            message="Another cool review or message..."
            reverse
          />

          <GenreCatalogSection
            genreName={genre.name}
            sectionType="Manga"
            books={genre.books}
            message="Reviews or insights text here."
          />
        </section>
      )}
    </div>
  );
}

//==============================================================================
interface GenreCatalogSectionProps {
  genreName: string;
  sectionType: string;
  message: string;
  reverse?: boolean;
  books?: Book[];
}

export const GenreCatalogSection: React.FC<GenreCatalogSectionProps> = ({
  genreName,
  sectionType,
  message,
  reverse = false,
  books = [],
}) => {
  return (
    <section id={`genre-${genreName}-catalog`} className="flex justify-center">
      <div className="flex flex-col items-center gap-1 w-full">
        <div>
          <h2 className="mt-2 text-3xl font-extrabold text-accent text-center">
            {genreName} {sectionType}
          </h2>
          <div className="w-full rounded-b-lg border-b-4 border-popover mb-1" />
        </div>
        <div
          className={`flex flex-col lg:flex-row gap-4 w-full mb-4 ${
            reverse ? "lg:flex-row-reverse" : ""
          }`}
        >
          <div className="flex-1 min-w-0">
            <BookShowcase books={books} />
          </div>

          <div className="w-full lg:w-[300px] h-full bg-muted rounded-lg p-4 border-accent border-2 border-b-8">
            <p className="text-center text-sm">{message}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
//==============================================================================
