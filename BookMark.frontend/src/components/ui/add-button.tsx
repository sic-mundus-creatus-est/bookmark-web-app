import { Plus } from "lucide-react";

interface AddButtonProps {
  label: string;
  onClick: () => void;
}
export function AddButton({ label, onClick }: AddButtonProps) {
  return (
    <button
      title={`${label}`}
      onClick={onClick}
      className="flex items-center gap-1 bg-accent text-background font-bold px-3 py-2 rounded-lg transition border-b-4 border-popover hover:text-popover"
    >
      <Plus className="text-popover" strokeWidth={3} />
      {label}
    </button>
  );
}
