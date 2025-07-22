import { Book } from "@/lib/types/book";
import { Author } from "@/lib/types/author";
import { BookCard } from "@/components/ui/book/book-card";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useEffect, useState } from "react";

interface BookShowcaseProps {
  fetchBooks: (
    page: number,
    limit: number
  ) => Promise<{
    items: Book[];
    pageIndex: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  }>;
}
export function BookShowcase({ fetchBooks }: BookShowcaseProps) {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  function mapBooks(items: any[]): Book[] {
    return (items ?? []).map(
      (book): Book => ({
        id: book.id,
        title: book.title,
        authors: book.authors?.map((a: Author) => a),
        originalLanguage: book.originalLanguage,
        pageCount: book.pageCount,
        description: book.description,
        coverImage: book.coverImage,
        rating: Math.random() * 2 + 3,
        ratingCount: Math.floor(Math.random() * 1000),
      })
    );
  }

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      try {
        const response = await fetchBooks(1, 10);
        setAllBooks(mapBooks(response.items));
      } catch (e) {
        console.error("Failed to fetch books", e);
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, [fetchBooks]);

  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full"
    >
      <CarouselContent>
        {/*TODO: add loading placeholders*/}
        {loading
          ? "loading"
          : allBooks.map((book) => (
              <CarouselItem
                key={book.id}
                className=" basis-1/2 sm:basis-1/2 md:basis-1/2 lg:basis-1/2 xl:basis-1/4"
              >
                <div className="flex items-center">
                  <BookCard book={book} />
                </div>
              </CarouselItem>
            ))}
      </CarouselContent>

      <CarouselPrevious
        className="absolute left-2 top-[35%] -translate-y-1/2 bg-accent/50 text-muted rounded-lg hover:text-popover z-10 border-popover px-5 border-2"
        aria-label="Previous"
      />
      <CarouselNext
        className="absolute right-2 top-[35%] -translate-y-1/2 bg-accent/50 text-muted rounded-lg hover:text-popover z-10 border-popover px-5 border-2"
        aria-label="Next"
      />
    </Carousel>
  );
}
