import React from "react";

interface FloatingActionButtonProps {
  label: string;
  icon: React.ReactElement;
  onClick: () => void;
}

export function FloatingActionButton({
  label,
  icon,
  onClick,
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center bottom-6 right-6 rounded-full px-3 py-2 gap-2 text-accent bg-popover border-accent border-2 border-b-4 hover:bg-popover/90 transition"
      aria-label={label}
    >
      {React.cloneElement(icon, { className: "w-7 h-7" })}
      <span className="text-sm font-bold text-background">{label}</span>
    </button>
  );
}
