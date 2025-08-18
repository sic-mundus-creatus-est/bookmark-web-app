import { useEffect, useState } from "react";

import { getAllBookTypes } from "@/lib/services/api-calls/bookApi";
import { BookType } from "@/lib/types/book";

interface BookTypePickerProps {
  value?: string;
  onChange?: (selected: BookType) => void;
}
export function BookTypePicker({ value, onChange }: BookTypePickerProps) {
  const [isLoading, setIsLoading] = useState(true);

  const [allBookTypes, setAllBookTypes] = useState<BookType[]>([]);

  useEffect(() => {
    const fetchBookTypes = async () => {
      try {
        setIsLoading(true);
        const response: BookType[] = await getAllBookTypes();

        const sorted = [...response].sort((a, b) =>
          a.name[0].toLowerCase().localeCompare(b.name[0].toLowerCase())
        );

        setAllBookTypes(sorted);
      } catch (error: any) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookTypes();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-between w-full text-accent">
        {[...Array(3)].map((_, index) => (
          <button
            key={index}
            className={`flex-1 bg-muted text-accent border-2 border-accent cursor-pointer ${
              index === 1 ? "bg-muted/50" : "bg-muted"
            }`}
            disabled
          >
            <span className="flex items-center justify-center h-6">
              {index === 1 && (
                <span className="text-xs italic text-muted-foreground font-bold">
                  Loading types...
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full text-accent">
      {allBookTypes.map((bookType) => (
        <button
          key={bookType.id}
          className={`
          flex-1 cursor-pointer font-bold
          ${
            value === bookType.id
              ? "bg-accent text-popover font-extrabold border-2 border-popover"
              : "bg-muted hover:bg-accent hover:text-muted hover:border-popover text-accent border-2 border-accent"
          }
        `}
          onClick={() => onChange?.(bookType)}
        >
          <span className="text-center block lowercase">{bookType.name}</span>
        </button>
      ))}
    </div>
  );
}
