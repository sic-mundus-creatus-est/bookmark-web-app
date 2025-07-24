import { Link } from "react-router-dom";

import { X } from "lucide-react";

import { BookAuthorRoleSelector } from "@/components/ui/book/book-author-role-selector";
import { AuthorWithNameAndRole } from "@/lib/types/author";

interface BookAuthorEntriesProps {
  authors: AuthorWithNameAndRole[];
  onChange: (updatedAuthors: AuthorWithNameAndRole[]) => void;
}
export function BookAuthorEntries({
  authors,
  onChange,
}: BookAuthorEntriesProps) {
  const handleAuthorRoleChange = (authorIndex: number, newRoleId: number) => {
    const updatedAuthors = [...authors];
    updatedAuthors[authorIndex] = {
      ...updatedAuthors[authorIndex],
      roleId: newRoleId,
    };
    onChange(updatedAuthors);
  };

  const handleRemoveAuthor = (index: number) => {
    // skips the removed author
    const updatedAuthors = [
      ...authors.slice(0, index),
      ...authors.slice(index + 1),
    ];
    onChange(updatedAuthors);
  };

  return (
    <>
      <span className="italic">by </span>
      {authors.map((author, i) => (
        <div key={i} className="inline-flex items-center gap-2 mr-3">
          <div className="inline-flex gap-1">
            <Link to={`/author/${author.id}`}>
              <span className="text-accent hover:text-popover">
                {author.name}
              </span>
            </Link>
            <BookAuthorRoleSelector
              author={author}
              onChange={(newRoleId) => handleAuthorRoleChange(i, newRoleId)}
            />
          </div>

          <button
            type="button"
            title="Remove This Author"
            className="-ml-1 rounded-full text-muted focus:outline-none font-extrabold bg-accent hover:text-red-500"
            onClick={() => handleRemoveAuthor(i)}
          >
            <X strokeWidth={5} size={22} className="p-1" />
          </button>

          {authors.length > 1 && i !== authors.length - 1 && (
            <span className="-ml-1 font-bold">,</span>
          )}
        </div>
      ))}
    </>
  );
}
