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
    <div
      className="rounded-2xl w-full px-9 pt-3 pb-0 cursor-pointer hover:bg-gray-300"
      onClick={onClick}
    >
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
        <div className="flex justify-between pr-2 pt-1 pb-2 flex-wrap">
          <Logo />

          <Hamburger
            size={24}
            toggled={open}
            toggle={setOpen}
            direction="left"
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
            <div className="flex flex-col space-y-1 pb-9 pt-4 px-4 items-stretch">
              <div className="bg-card rounded-2xl w-full pb-3 pt-1 px-4 flex flex-col shadow-xl">
                {navConfig.Categories.items!.map((item) => (
                  <div key={item.title}>
                    <DrawerButton
                      text={item.title.toUpperCase()}
                      onClick={() => console.log(`${item.title} clicked`)}
                    />
                    <div className="h-px w-full bg-border"></div>
                  </div>
                ))}
              </div>

              <div className="relative w-full">
                <Input
                  placeholder="Search..."
                  className="w-full bg-secondary pl-4 pr-12"
                />
                <span className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-ring p-2 rounded-r-2xl text-white">
                  <SearchIcon size={20} strokeWidth={3} />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
