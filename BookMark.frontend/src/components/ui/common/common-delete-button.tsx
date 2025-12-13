import { Trash2 } from "lucide-react";

interface CommonDeleteButtonProps {
  onClick: () => void;
}
export function CommonDeleteButton({ onClick }: CommonDeleteButtonProps) {
  return (
    <button
      title="RIP"
      onClick={(e) => {
        onClick();
        e.currentTarget.blur();
      }}
    >
      <span className="flex flex-row items-center text-xl px-0.5 font-bold font-[Candara] text-accent hover:text-red-700">
        <Trash2 size={24} strokeWidth={2} /> Delete
      </span>
    </button>
  );
}
