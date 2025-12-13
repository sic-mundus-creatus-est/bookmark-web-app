import { Trash2 } from "lucide-react";

interface CommonDeleteButtonProps {
  label?: string;
  onClick: () => void;
  className?: string;
}

export function CommonDeleteButton({
  label = "Delete",
  onClick,
  className,
}: CommonDeleteButtonProps) {
  return (
    <button
      className={`text-accent hover:text-red-700 ${className ?? ""}`}
      onClick={(e) => {
        onClick();
        e.currentTarget.blur();
      }}
    >
      <span className="flex flex-row items-center text-xl px-0.5 font-bold font-[Candara]">
        <Trash2 size={24} strokeWidth={2} /> {label}
      </span>
    </button>
  );
}
