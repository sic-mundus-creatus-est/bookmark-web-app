import { SquarePen, X } from "lucide-react";

interface CommonEditButtonProps {
  value: boolean;
  onClick: () => void;
  className?: string;
}
export function CommonEditButton({
  value,
  onClick,
  className,
}: CommonEditButtonProps) {
  return (
    <div className="flex justify-center md:justify-end mx-0 md:mx-2 mt-2 pt-2">
      <button
        title={value ? "Cancel Editing" : "Edit"}
        onClick={(e) => {
          onClick();
          e.currentTarget.blur();
        }}
        className={`text-accent hover:text-popover + ${className}`}
      >
        {value ? (
          <X size={24} strokeWidth={5} />
        ) : (
          <SquarePen size={24} strokeWidth={3} />
        )}
      </button>
    </div>
  );
}
