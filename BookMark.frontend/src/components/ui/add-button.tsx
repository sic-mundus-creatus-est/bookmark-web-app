import { Plus } from "lucide-react";

interface AddButtonProps {
  label: string;
  errorLabel?: string | null;
  onClick: () => void;
}
export function AddButton({ label, errorLabel, onClick }: AddButtonProps) {
  return (
    <div className="flex flex-col items-end">
      {errorLabel && (
        <div className="-mt-2 mb-1 text-right text-sm font-mono font-bold italic text-red-500">
          {errorLabel}
        </div>
      )}
      <button
        title={`${label}`}
        onClick={onClick}
        className="flex items-center gap-1 px-3 py-2 bg-accent text-background font-bold rounded-lg transition border-b-4 border-popover hover:text-popover"
      >
        <Plus className="text-popover" strokeWidth={3} />
        {label}
      </button>
    </div>
  );
}
