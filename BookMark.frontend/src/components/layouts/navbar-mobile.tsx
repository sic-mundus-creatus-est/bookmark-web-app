import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import Hamburger from "hamburger-react";

import { navConfig } from "@/config/navConfig";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";

interface IDrawerButtonProps {
  title: string;
  onClick: () => void;
}

const DrawerButton: React.FC<IDrawerButtonProps> = ({ title, onClick }) => {
  return (
    <div className="w-full px-9 pt-3 pb-0 cursor-pointer" onClick={onClick}>
      <span className="block text-xl text-end font-bold truncate">{title}</span>
    </div>
  );
};

export function MobileNavbar() {
  const [open, setOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // so that the closing animation works
  useEffect(() => {
    if (open) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <>
      <div className="w-full items-center lg:hidden">
        {/* static */}
        <div className="flex flex-wrap justify-between pb-2 px-2">
          <Logo />

          <Hamburger
            size={24}
            toggled={open}
            toggle={setOpen}
            direction="left"
            color="hsl(var(--accent))"
          />
        </div>

        {/* dynamic --- shows up when clicking on the hamburger */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            open
              ? "max-h-screen opacity-100 transform scale-100"
              : "max-h-0 opacity-0 transform scale-95"
          }`}
        >
          {shouldRender && (
            <div className="flex flex-col items-stretch space-y-1 pb-4 pt-2 px-4 text-background">
              <div className="w-full flex flex-col rounded-lg pb-3 pt-1 px-2 bg-accent border-b-4 border-popover">
                {navConfig.Categories.items!.map((item, index) => {
                  return (
                    <div
                      key={item.title}
                      className={`rounded-md font-[Verdana] hover:text-popover ${
                        (index == 0 || index == 1) &&
                        `border-b-4 border-accent-foreground`
                      } ${index == 2 && `-mb-1`}`}
                    >
                      <DrawerButton
                        title={item.title.toUpperCase()}
                        onClick={() => console.log(`${item.title} clicked`)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div
          className="relative pb-2 px-6"
          style={{ minWidth: "clamp(20rem, 30vw, 100%)" }}
        >
          <Input
            placeholder="Search..."
            className="w-full rounded-lg bg-muted text-accent border-b-2 border-accent"
          />
          <span className="absolute right-0 mr-6 p-2 rounded-r-lg bg-accent text-background transform -translate-y-9">
            <SearchIcon size={20} strokeWidth={3} />
          </span>
        </div>
      </div>
    </>
  );
}
