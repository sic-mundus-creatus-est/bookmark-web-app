import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RatingToStars } from "@/lib/utils/bookUtils";

const mockBook = [
  {
    id: "the-alchemist",
    title: "The Alchemist And a Pot",
    author: ["Paulo Coelho", "Monkey", "Tiger", "Lion", "Jacks", "Macko"],
    rating: 4.7,
    reviews: 12839,
    genres: ["Fiction", "Adventure", "Philosophy"],
    description:
      "For twelve thousand years the Galactic Empire has ruled supreme. Now it is dying. Only Hari Seldon, creator of the revolutionary science of psychohistory, can see into the future—a dark age of ignorance, barbarism, and warfare that will last thirty thousand years.",
    cover: `https://covers.openlibrary.org/b/id/2049.jpg`,
    published: "1984",
    pages: 208,
  },
];

export function BookPage() {
  const { id } = useParams<{ id: string }>();
  const book = mockBook.find((b) => b.id === id);

  if (!book) {
    return (
      <div className="text-center p-10 text-lg font-mono text-muted-foreground">
        Book not found.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-14">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 items-start p-4">
        {/* Cover */}
        <Card className="shadow-md rounded-b-3xl w-full mx-auto">
          <CardContent
            className="p-0 bg-gray-100"
            style={{ aspectRatio: "2 / 3" }}
          >
            <img
              src={book.cover}
              alt={`Cover of ${book.title}`}
              className="w-full h-full"
            />
          </CardContent>
          <CardFooter className="pb-2 flex flex-col px-4">
            <div className="flex justify-center mx-10">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-5">
                  <RatingToStars rating={book.rating} size="3xl" />
                  <span className="text-3xl font-medium">
                    {book.rating.toFixed(1)}
                  </span>
                </div>

                <div className="pl-1 -mt-3">
                  <span className="text-xs font-mono text-gray-400">
                    {book.reviews.toLocaleString()} ratings
                  </span>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Book Info */}
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl sm:text-2xl md:text-4xl lg:text-4xl xl:text-4xl font-sans font-bold text-gray-900 leading-tight border-b pb-2 whitespace-normal">
              {book.title}
            </h1>

            <p
              className="text-lg font-serif text-gray-600 pl-4 px-1 pt-2"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.047), rgba(0,0,0,0.0))",
              }}
            >
              <span className="italic">by </span>
              {book.author.map((a, i) => (
                <span key={a} className="text-xl">
                  {a}
                  {i < book.author.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
          </div>

          <div>
            <div className="pl-4 text-sm font-mono">
              <div className="uppercase text-xs text-gray-400 tracking-wider border-t border-dashed border-gray-300 w-fit inline-block pb-2">
                Genres
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pl-2">
              {book.genres.map((genre) => (
                <Badge
                  key={genre}
                  className="rounded-full px-3 py-1 text-xs font-medium tracking-wide bg-black text-white shadow-lg shadow-gray-300 transition-colors duration-200 hover:bg-white hover:text-black hover:border hover:border-black"
                >
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start gap-6 text-sm font-mono text-gray-500 pl-4">
            <div className="border-t border-dashed border-gray-300 pt-1 w-fit">
              <div className="uppercase text-xs text-gray-400 mb-1 tracking-wider">
                Published in
              </div>
              <span className="font-extrabold text-md text-black">
                {book.published}.
              </span>
            </div>
            <div className="border-t border-dashed border-gray-300 pt-1 w-fit">
              <div className="uppercase text-xs text-gray-400 mb-1 tracking-wider">
                Pages
              </div>
              <span className="font-extrabold text-md text-black">
                {book.pages}
              </span>
            </div>
            <div className="border-t border-dashed border-gray-300 pt-1 w-fit">
              <div className="uppercase text-xs text-gray-400 mb-1 tracking-wider">
                Written in
              </div>
              <span className="uppercase font-mono font-bold text-md text-black">
                Portuguese
              </span>
            </div>
          </div>

          <Separator />

          <p className="text-base leading-relaxed text-gray-800 font-[Georgia] indent-4 pl-4">
            {book.description}
          </p>
        </div>
      </div>
    </div>
  );
}
