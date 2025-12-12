import { Book } from "@/lib/types/book";
import { Link } from "react-router-dom";

interface BookMainMetadataProps {
  book?: Book;
}
export function BookMainMetadata({ book }: BookMainMetadataProps) {
  return (
    <div className="w-full">
      <h1 className="text-2xl sm:text-2xl md:text-4xl lg:text-4xl w-full font-[Verdana] font-bold text-accent leading-tight overflow-hidden">
        {book?.title}
      </h1>
      <div
        className="text-lg font-serif text-accent pl-4 px-1 pt-2 mt-0.5"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.074), rgba(0,0,0,0.0))",
        }}
      >
        <span className="italic">by </span>
        {book?.authors.map((ba, i) => (
          <Link to={`/author/${ba.id}`} key={ba.id}>
            <span className="text-xl hover:text-popover">
              {ba.name}
              {i < book.authors.length - 1 ? ", " : ""}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
