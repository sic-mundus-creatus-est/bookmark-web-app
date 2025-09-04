import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { CircleUserRound, SquarePen, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BookShowcase } from "@/components/layouts/book-showcase";
import { Author } from "@/lib/types/author";
import { getAuthorById } from "@/lib/services/api-calls/authorApi";
import { getGenresByAuthor } from "@/lib/services/api-calls/genreApi";
import { getBooksByAuthor } from "@/lib/services/api-calls/bookApi";
import { CommonDescription } from "@/components/ui/common/common-description";
import { SubmitButton } from "@/components/ui/submit-button";

export function AuthorPage() {
  //-------------------------------------------------------
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);

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
          getGenresByAuthor(id),
          getBooksByAuthor(id, 10),
        ]);

        console.log(genres);

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
    <div className="flex-grow max-w-full container mx-auto sm:px-16 lg:px-24 xl:px-32 my-4 sm:mt-10">
      <div className="flex justify-end mx-0 md:mx-2 mt-2 pt-2">
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

          {editMode ? null : (
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
          )}

          <CommonDescription description={author.biography} />
        </div>
      </div>

      {editMode ? null : (
        <div className="mb-4 mt-4">
          <h2 className="text-accent text-center text-2xl italic pb-1 font-[Verdana] font-bold">
            Best From This Author:
          </h2>
          <div className="w-full flex justify-center flex-1 min-w-0">
            <BookShowcase books={author.books!} />
          </div>
        </div>
      )}

      {editMode ? (
        <div className="flex justify-end mt-2">
          <SubmitButton
            label="Update"
            onSubmit={() => console.log("I know what I know")}
            showCancel
            onCancel={() => setEditMode((prev) => !prev)}
          />
        </div>
      ) : null}
    </div>
  );
}
