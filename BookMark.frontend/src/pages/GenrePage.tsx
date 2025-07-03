import { Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { BookShowcase } from "@/components/layouts/book-showcase";
import { getConstrainedBooks } from "@/lib/services/api-calls/bookService";
import { getGenreById } from "@/lib/services/api-calls/genreService";
import { Genre } from "@/lib/types/genre";

const fetchBooksFromApi = async (pageIndex: number, pageSize: number) => {
  const response = await getConstrainedBooks({
    pageIndex: pageIndex,
    pageSize: pageSize,
  });

  return response;
};

export function GenrePage() {
  //-------------------------------------------------------
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [genre, setGenre] = useState<Genre | null>(null);
  //-------------------------------------------------------

  //==============================================================================
  useEffect(() => {
    async function fetchBook() {
      try {
        setLoading(true);
        setError(false);

        const data = await getGenreById(id!);
        setGenre(data);
      } catch (e) {
        console.error("Error fetching book:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
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
    <div className="px-6 my-2 font-sans text-accent">
      <h1 className="text-3xl leading-tight font-bold mx-4 font-[Verdana]">
        {genre.name}
      </h1>

      <section id="genre-metadata">
        <div className="flex items-center text-sm px-4 text-accent/50 leading-tight mb-2">
          <Tag className="mr-1 w-4 h-4 text-accent" />
          <span className="hover:underline cursor-pointer">Genres</span>
          <span className="mx-1">›</span>
          <span className="text-popover font-semibold">{genre.name}</span>
        </div>

        <GenreDescription description={genre.description} maxLength={400} />
      </section>

      <section id="genre-catalogs" className="">
        <GenreCatalogSection
          id="genre-books-catalog"
          genreName={genre.name}
          sectionType="Books"
          fetchBooks={fetchBooksFromApi}
          message="Random featured review or message..."
        />

        <GenreCatalogSection
          id="genre-comics-catalog"
          genreName={genre.name}
          sectionType="Comics"
          fetchBooks={fetchBooksFromApi}
          message="Another cool review or message..."
          reverse
        />

        <GenreCatalogSection
          id="genre-manga-catalog"
          genreName={genre.name}
          sectionType="Manga"
          fetchBooks={fetchBooksFromApi}
          message="Reviews or insights text here."
        />
      </section>
    </div>
  );
}

//==============================================================================
interface GenreCatalogSectionProps {
  id: string;
  genreName: string;
  sectionType: string;
  fetchBooks: (pageIndex: number, pageSize: number) => Promise<any>;
  message: string;
  reverse?: boolean;
}

export const GenreCatalogSection: React.FC<GenreCatalogSectionProps> = ({
  id,
  genreName,
  sectionType,
  fetchBooks,
  message,
  reverse = false,
}) => {
  return (
    <section id={id} className="flex justify-center lg:mx-5 xl:mx-10">
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
            <BookShowcase fetchBooks={fetchBooks} />
          </div>

          <div className="w-full lg:w-[300px] h-full bg-muted rounded-lg p-4 border-accent border-2 border-b-8">
            <p className="text-center text-sm">{message}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

interface GenreDescriptionProps {
  description?: string;
  maxLength?: number;
}
function GenreDescription({
  description = "No description",
  maxLength = 400,
}: GenreDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!description) return null;

  const isLong = description.length > maxLength;
  const displayText =
    expanded || !isLong ? description : description.slice(0, maxLength);

  return (
    <p
      className="indent-4 text-base font-[Georgia] leading-tight rounded-lg bg-muted p-2 px-3 mx-2 border-2 border-b-4 border-accent break-words"
      style={{ cursor: isLong ? "pointer" : "default" }}
      onClick={() => isLong && setExpanded(!expanded)}
    >
      {displayText}
      {isLong && (
        <span className="text-accent font-bold ml-1 underline">
          {expanded ? "(less)" : "...more"}
        </span>
      )}
    </p>
  );
}
//==============================================================================
