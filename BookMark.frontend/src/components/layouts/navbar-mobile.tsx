import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import Hamburger from "hamburger-react";

import { navConfig } from "@/config/navConfig";
import { Input } from "@/components/ui/input";
import Logo from "@/components/logo";

interface IDrawerButtonProps {
  text: string;
  onClick: () => void;
}

const DrawerButton: React.FC<IDrawerButtonProps> = ({ text, onClick }) => {
  return (
    <div className="w-full px-9 pt-3 pb-0 cursor-pointer" onClick={onClick}>
      <span className="text-xl text-end block font-bold font- truncate">
        {text}
      </span>
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
      <div className="lg:hidden w-full items-center">
        {/* static */}
        <div className="flex justify-between pb-2 flex-wrap px-2">
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
            <div className="flex flex-col space-y-1 pb-4 pt-2 px-4 items-stretch text-background">
              <div className="bg-accent rounded-lg w-full pb-3 pt-1 px-4 flex flex-col shadow-xl">
                {navConfig.Categories.items!.map((item) => (
                  <div key={item.title} className="hover:text-popover">
                    <DrawerButton
                      text={item.title.toUpperCase()}
                      onClick={() => console.log(`${item.title} clicked`)}
                    />
                    <div className="h-px w-full bg-popover"></div>
                  </div>
                ))}
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
            className="bg-muted text-accent rounded-lg border-b-2 border-accent w-full"
          />
          <span className="absolute right-0 mr-6 transform -translate-y-9 bg-accent p-2 rounded-r-lg text-background">
            <SearchIcon size={20} strokeWidth={3} />
          </span>
        </div>
      </div>
    </>
  );
}
