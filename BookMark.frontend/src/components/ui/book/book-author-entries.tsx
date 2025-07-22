import { X } from "lucide-react";

import { BookAuthorRoleSelector } from "@/components/ui/book/book-author-role-selector";
import { AuthorWithNameAndRole } from "@/lib/types/author";

interface BookAuthorEntriesProps {
  bookAuthors: AuthorWithNameAndRole[];
  handleAuthorRoleChange: (index: number, newRoleId: number) => void;
  handleRemoveAuthor: (index: number) => void;
}
export function BookAuthorEntries({
  bookAuthors,
  handleAuthorRoleChange,
  handleRemoveAuthor,
}: BookAuthorEntriesProps) {
  return (
    <>
      <span className="italic">by </span>
      {bookAuthors.map((author, i) => (
        <div key={i} className="inline-flex items-center gap-2 mr-3">
          <div className="inline-flex gap-1">
            <span className="text-accent">{author.name}</span>
            <BookAuthorRoleSelector
              author={author}
              onChange={(newRoleId) => handleAuthorRoleChange(i, newRoleId)}
            />
          </div>

          <button
            type="button"
            title="Remove This Author"
            className="text-muted hover:text-red-500 font-extrabold focus:outline-none bg-accent rounded-full -ml-1"
            onClick={() => handleRemoveAuthor(i)}
          >
            <X strokeWidth={5} size={22} className="p-1" />
          </button>

          {bookAuthors.length > 1 && i !== bookAuthors.length - 1 && (
            <span className="-ml-1 font-bold">,</span>
          )}
        </div>
      ))}
    </>
  );
}
