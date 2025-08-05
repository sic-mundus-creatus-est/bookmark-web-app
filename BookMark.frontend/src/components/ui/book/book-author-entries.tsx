import { Link } from "react-router-dom";

import { X } from "lucide-react";

import { BookAuthorRoleSelector } from "@/components/ui/book/book-author-role-selector";
import { AuthorWithNameAndRole } from "@/lib/types/author";
import { bookAuthorRoles } from "@/config/roles";

interface BookAuthorEntriesProps {
  entries?: AuthorWithNameAndRole[];
  onChange?: (updatedAuthors: AuthorWithNameAndRole[]) => void;
}
export function BookAuthorEntries({
  entries = [],
  onChange,
}: BookAuthorEntriesProps) {
  const handleAuthorRoleChange = (authorIndex: number, newRoleId: number) => {
    const updatedAuthors = [...entries];
    updatedAuthors[authorIndex] = {
      ...updatedAuthors[authorIndex],
      roleId: newRoleId,
    };
    onChange?.(updatedAuthors);
  };

  const handleRemoveAuthor = (index: number) => {
    // skips the removed author
    const updatedAuthors = [
      ...entries.slice(0, index),
      ...entries.slice(index + 1),
    ];
    onChange?.(updatedAuthors);
  };

  return (
    <>
      <span className="italic font-serif">by </span>
      {entries.map((author, i) => (
        <div key={author.id} className="inline-flex items-center gap-2 mr-3">
          <div className="inline-flex gap-1">
            <Link to={`/author/${author.id}`}>
              <span
                className="text-accent hover:text-popover"
                title={`${
                  bookAuthorRoles[author.roleId as keyof typeof bookAuthorRoles]
                    .label
                }`}
              >
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

          {entries.length > 1 && i !== entries.length - 1 && (
            <span className="-ml-1 font-bold">,</span>
          )}
        </div>
      ))}
    </>
  );
}
