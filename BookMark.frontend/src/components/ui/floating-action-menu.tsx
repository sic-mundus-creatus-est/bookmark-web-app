import { useState, useRef, useEffect, ReactNode } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionMenuProps {
  children: ReactNode;
}

export function FloatingActionMenu({ children }: FloatingActionMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="z-40 fixed flex flex-col items-end bottom-4 right-4 gap-3"
    >
      {open && children}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-accent text-background border-popover border-2 border-b-4 hover:bg-accent/90 transition"
        aria-label="Toggle Floating Action Menu"
      >
        <Plus
          className={cn("w-6 h-6 transition-transform", open && "rotate-45")}
        />
      </button>
    </div>
  );
}
