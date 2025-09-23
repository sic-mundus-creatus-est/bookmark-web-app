import { Plus } from "lucide-react";

interface CommonSubmitButtonProps {
  label: string;
  errorLabel?: string;
  showCancel?: boolean;
  onClick?: () => void;
  onCancel?: () => void;
}
export function CommonSubmitButton({
  label = "Submit",
  errorLabel,
  showCancel = false,
  onClick,
  onCancel,
}: CommonSubmitButtonProps) {
  return (
    <div className="flex flex-col">
      {errorLabel && (
        <div className="-mt-2 mb-1 text-right text-sm font-mono font-bold italic text-red-500">
          {errorLabel}
        </div>
      )}
      <div className="flex items-center gap-7">
        {showCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-lg italic font-extrabold text-popover hover:text-red-500 transition border-b-2 border-accent hover:border-red-500"
          >
            Cancel
          </button>
        ) : null}

        <button
          type="submit"
          title={label}
          onClick={onClick}
          className="flex justify-center w-full gap-1 px-3 py-2 bg-accent text-background font-bold rounded-lg transition border-b-4 border-popover hover:text-popover"
        >
          <Plus className="text-popover" strokeWidth={3} />
          {label}
        </button>
      </div>
    </div>
  );
}
