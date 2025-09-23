import { BookType } from "@/lib/types/book";

interface BookTypePickerProps {
  value?: BookType;
  allBookTypes?: BookType[];
  onChange?: (selected: BookType) => void;
}
export function BookTypePicker({
  value,
  allBookTypes = [],
  onChange,
}: BookTypePickerProps) {
  return (
    <div className="flex items-center justify-between w-full text-accent">
      {allBookTypes.map((bookType) => (
        <button
          key={bookType.id}
          className={`
          flex-1 cursor-pointer font-bold
          ${
            value?.id === bookType.id
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
