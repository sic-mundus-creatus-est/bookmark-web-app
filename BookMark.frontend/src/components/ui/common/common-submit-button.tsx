import { Loader2, Plus } from "lucide-react";

interface CommonSubmitButtonProps {
  label: string;
  showCancel?: boolean;
  onClick?: () => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function CommonSubmitButton({
  label = "Submit",
  showCancel = false,
  onClick,
  onCancel,
  loading = false,
}: CommonSubmitButtonProps) {
  return (
    <div className="flex items-center gap-3">
      {showCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="text-lg italic font-extrabold text-popover hover:text-red-500 transition border-b-2 border-accent hover:border-red-500"
        >
          Cancel
        </button>
      )}

      <button
        type="submit"
        title={label}
        onClick={onClick}
        className="w-full flex justify-center gap-1 px-3 py-2 bg-accent text-background font-bold rounded-lg transition border-b-4 border-popover hover:text-popover"
      >
        {loading ? (
          <Loader2 className="animate-spin text-popover" strokeWidth={3} />
        ) : (
          <>
            <Plus className="text-popover" strokeWidth={3} />
            {label}
          </>
        )}
      </button>
    </div>
  );
}

interface CommonErrorLabelProps {
  error: string;
}
export function CommonErrorLabel({ error }: CommonErrorLabelProps) {
  return (
    <div className="w-full -mt-2 mb-1 text-right text-sm font-mono font-bold italic text-red-600 break-words">
      {error}
    </div>
  );
}
