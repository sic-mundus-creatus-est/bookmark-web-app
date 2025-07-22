import { bookAuthorRoles } from "@/config/roles";
import { AuthorWithNameAndRole } from "@/lib/types/author";
import { useEffect, useRef, useState } from "react";

export function BookAuthorRoleSelector({
  author,
  onChange,
}: {
  author: AuthorWithNameAndRole;
  onChange: (roleId: number) => void;
}) {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        title="Change Author's Role"
        onClick={() => setDropdownOpen((open) => !open)}
        className="text-accent bg-transparent hover:text-popover focus:outline-none select-none"
      >
        ▼
      </button>
      {dropdownOpen && (
        <ul
          role="listbox"
          tabIndex={-1}
          className="z-20 absolute overflow-auto rounded-lg bg-muted border-accent border-2 border-b-4 right-0 font-[Helvetica] font-medium"
        >
          {Object.values(bookAuthorRoles).map((role) => (
            <li
              key={role.id}
              role="option"
              tabIndex={0}
              aria-selected={author.roleId === role.id}
              className={`cursor-pointer px-3 hover:bg-accent ${
                author.roleId === role.id
                  ? "bg-accent text-popover font-semibold border-4 border-popover"
                  : "text-accent hover:text-muted"
              }`}
              onClick={() => {
                onChange(role.id);
                setDropdownOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onChange(role.id);
                  setDropdownOpen(false);
                }
              }}
            >
              {role.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
