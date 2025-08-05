import { Plus } from "lucide-react";

interface SubmitButtonProps {
  label: string;
  errorLabel?: string | null;
  showCancel?: boolean;
  onSubmit: () => void;
  onCancel?: () => void;
}
export function SubmitButton({
  label = "Submit",
  errorLabel,
  showCancel = false,
  onSubmit,
  onCancel,
}: SubmitButtonProps) {
  return (
    <div className="flex flex-col items-end">
      {errorLabel && (
        <div className="-mt-2 mb-1 text-right text-sm font-mono font-bold italic text-red-500">
          {errorLabel}
        </div>
      )}
      <div className="flex items-center gap-7">
        {showCancel ? (
          <button
            onClick={onCancel}
            className="text-lg italic font-extrabold text-popover hover:text-red-500 transition border-b-2 border-accent hover:border-red-500"
          >
            Cancel
          </button>
        ) : null}

        <button
          title={label}
          onClick={onSubmit}
          className="flex items-center gap-1 px-3 py-2 bg-accent text-background font-bold rounded-lg transition border-b-4 border-popover hover:text-popover"
        >
          <Plus className="text-popover" strokeWidth={3} />
          {label}
        </button>
      </div>
    </div>
  );
}
