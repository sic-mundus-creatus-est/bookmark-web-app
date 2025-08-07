import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { CircleUserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BookShowcase } from "@/components/layouts/book-showcase";
import { Author } from "@/lib/types/author";
import {
  getAuthorBookGenres,
  getAuthorById,
  getBooksByAuthor,
} from "@/lib/services/api-calls/authorService";
import { GenreDescription } from "@/pages/GenrePage";

export function AuthorPage() {
  //-------------------------------------------------------
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [author, setAuthor] = useState<Author | null>(null);
  //-------------------------------------------------------
  useEffect(() => {
    async function fetchAuthor() {
      try {
        setLoading(true);
        setError(false);

        if (!id) throw new Error("No author ID provided");

        const [data, genres, books] = await Promise.all([
          getAuthorById(id),
          getAuthorBookGenres(id),
          getBooksByAuthor(id, 10),
        ]);

        setAuthor({
          ...data,
          genres,
          books,
        });
      } catch (e) {
        console.error("Error fetching book:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchAuthor();
  }, [id]);
  //-----------------------------------------------------
  if (loading) {
    return (
      <div className="text-center p-10 text-lg font-mono text-muted-foreground">
        Loading author...
      </div>
    );
  }
  //-----------------------------------------------------
  if (error || !author) {
    return (
      <div className="text-center p-10 text-lg font-mono text-destructive">
        Author not found.
      </div>
    );
  }
  //-----------------------------------------------------

  return (
    <>
      <div
        className="my-4 sm:mt-10 flex flex-col items-center sm:flex-row sm:items-start gap-6 mx-4 sm:mx-12 md:mx-16 text-accent justify-center"
        style={{ minWidth: "clamp(20rem, 20vw, 100%)" }}
      >
        <div className="flex-shrink-0 flex flex-col items-center">
          <CircleUserRound
            size={100}
            strokeWidth={1}
            className="text-accent w-20 h-20 sm:w-auto sm:h-auto"
          />
          <span className="font-extrabold font-mono text-xl -mt-2">Author</span>
        </div>
        <div className="w-full max-w-3xl">
          <div className="flex-shrink-0 flex justify-center sm:block -mt-4 sm:mt-0">
            <h2 className="text-4xl font-semibold font-[Verdana]">
              {author.name}
            </h2>
          </div>
          <div className="flex-shrink-0 flex justify-center sm:block">
            <p className="text-muted-foreground mb-2 ml-2 font-[Georgia] text-xl">
              (
              {author.birthDate && (
                <time>{new Date(author.birthDate).getFullYear()}</time>
              )}{" "}
              –{" "}
              {author.deathDate ? (
                <time>{new Date(author.deathDate).getFullYear()}</time>
              ) : (
                ""
              )}
              )
            </p>
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

          <GenreDescription description={author.biography} maxLength={400} />
        </div>
      </div>

      <div
        className="mb-4 px-4 sm:px-12 md:px-16 2xl:px-40"
        style={{ minWidth: "clamp(22rem, 22vw, 100%)" }}
      >
        <h2 className="text-accent text-center text-2xl italic pb-1 font-[Verdana]">
          From This Author:
        </h2>
        <div className="w-full flex justify-center flex-1 min-w-0">
          <BookShowcase books={author.books!} />
        </div>
      </div>
    </>
  );
}
