import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RatingToStars } from "@/lib/utils/bookUtils";
import {
  getBookById,
  FILE_FETCH_BASE_URL,
} from "@/lib/services/api-calls/bookService";
import { useEffect, useState } from "react";
import { Book } from "@/lib/types/book";

export function BookPage() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchBook() {
      try {
        setLoading(true);
        setError(false);

        const data = await getBookById(id!);
        setBook(data);
      } catch (e) {
        console.error("Error fetching book:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center p-10 text-lg font-mono text-muted-foreground">
        Loading book...
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="text-center p-10 text-lg font-mono text-destructive">
        Book not found.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-4 sm:mx-4 md:mx-14 lg:mx-24 flex flex-col gap-14">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-10 items-start p-4">
        {/* Cover */}
        <Card className="shadow-md rounded-b-lg w-full mx-auto bg-accent rounded-t-lg">
          <CardContent
            className="p-0 bg-background rounded-t-lg"
            style={{ aspectRatio: "2 / 3" }}
          >
            <img
              src={
                book.coverImage
                  ? `${FILE_FETCH_BASE_URL}${book.coverImage}`
                  : "/cover_placeholder.jpg"
              }
              alt={`Cover of ${book.title}`}
              className="w-full h-full rounded-t-lg border-t-2 border-x-2 border-accent"
            />
          </CardContent>
          <CardFooter className="pb-2 flex flex-col px-4">
            <div className="flex justify-center mx-10">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-5">
                  <RatingToStars rating={3.4} size="3xl" />
                  <span className="text-3xl font-medium text-muted">
                    {/* {book.rating.toFixed(1)} */} {3.4}
                  </span>
                </div>

                <div className="pl-1 -mt-3">
                  <span className="text-xs font-mono text-background">
                    {/* {book.ratingCount?.toLocaleString() ?? 0} ratings */}{" "}
                    18587 ratings
                  </span>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Book Info */}
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl sm:text-2xl md:text-4xl lg:text-4xl xl:text-4xl font-[Verdana] font-bold text-accent leading-tight border-b pb-2 whitespace-normal">
              {book.title}
            </h1>

            <p
              className="text-lg font-serif text-accent pl-4 px-1 pt-2"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.047), rgba(0,0,0,0.0))",
              }}
            >
              <span className="italic">by </span>
              {book.authors.map((a, i) => (
                <span key={a.id} className="text-xl">
                  {a.firstName} {a.lastName}
                  {i < book.authors.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          </div>

          <div className="rounded-lg border-2 border-b-4 border-accent bg-muted px-5 py-6 space-y-6">
            {/* Genres */}
            <div className="flex flex-wrap items-start gap-3 text-sm font-[Verdana] pl-2">
              <div className="uppercase text-accent font-bold tracking-wider pt-1 whitespace-nowrap">
                Genres:
              </div>
              <div className="flex flex-wrap gap-2">
                {book.genres!.map((genre) => (
                  <Badge
                    key={`${genre.id}`}
                    className="rounded-full px-3 py-1 text-xs tracking-wide bg-accent text-background font-bold font-[Helvetica]"
                  >
                    {genre.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Book Metadata */}
            <div className="grid gap-y-3 text-sm font-[Verdana]">
              <div className="col-span-2 bg-background px-2 py-2 rounded">
                <div className="grid grid-cols-[auto_1fr] gap-x-4 items-center">
                  <div className="uppercase text-accent font-bold tracking-wider whitespace-nowrap">
                    Published in:
                  </div>
                  <div className="text-md text-accent">
                    {book.publicationYear}.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-[auto_1fr] gap-x-4 items-center px-2">
                <div className="uppercase text-accent font-bold tracking-wider whitespace-nowrap">
                  Pages:
                </div>
                <div className="text-md text-accent">{book.pageCount}</div>
              </div>

              <div className="col-span-2 bg-background px-2 py-2 rounded">
                <div className="grid grid-cols-[auto_1fr] gap-x-4 items-center">
                  <div className="uppercase text-accent font-bold tracking-wider whitespace-nowrap">
                    Written in:
                  </div>
                  <div className="text-md uppercase text-accent">
                    {book.originalLanguage}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-lg leading-relaxed text-accent font-[Georgia] indent-4 text-balance">
            {book.description}
          </p>
        </div>
      </div>
    </div>
  );
}
