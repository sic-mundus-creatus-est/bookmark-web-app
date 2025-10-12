import { BookLinkProps } from "@/lib/types/book";
import { BookCard } from "@/components/ui/book/book-card";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface BookShowcaseProps {
  books?: BookLinkProps[];
}
export function BookShowcase({ books = [] }: BookShowcaseProps) {
  return (
    <Carousel
      opts={{
        align: "start",
      }}
      className="w-full"
    >
      <CarouselContent>
        {books.map((book) => (
          <CarouselItem
            key={book.id}
            className=" basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/3 xl:basis-1/5"
          >
            <div className="flex items-center">
              <BookCard book={book} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious
        className="absolute left-4 top-[35%] -translate-y-1/2 bg-accent/70 hover:bg-accent text-muted rounded-lg hover:text-popover z-10 border-popover px-6 py-4 border-2 scale-110"
        aria-label="Previous"
      />
      <CarouselNext
        className="absolute right-4 top-[35%] -translate-y-1/2 bg-accent/70 hover:bg-accent text-muted rounded-lg hover:text-popover z-10 border-popover px-6 py-4 border-2 scale-110"
        aria-label="Next"
      />
    </Carousel>
  );
}
