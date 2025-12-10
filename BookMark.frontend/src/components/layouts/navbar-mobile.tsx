import { useEffect, useState } from "react";
import Hamburger from "hamburger-react";

import { navConfig } from "@/config/navConfig";
import { Logo } from "@/components/logo";
import { NavLink } from "react-router-dom";
import { CommonSearchBox } from "../ui/common/common-search-box";

interface MobileNavbarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}
export function MobileNavbar({ searchTerm, setSearchTerm }: MobileNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // so that the closing animation works
  useEffect(() => {
    if (menuOpen) {
      setMenuVisible(true);
    } else {
      const timer = setTimeout(() => {
        setMenuVisible(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [menuOpen]);

  return (
    <div className="w-full items-center lg:hidden">
      {/* static */}
      <div className="flex justify-between pb-2 -mx-1.5">
        <Logo />
        <div className="hover:[&>*]:text-[hsl(var(--popover))] text-[hsl(var(--accent))]">
          <Hamburger
            size={24}
            toggled={menuOpen}
            toggle={setMenuOpen}
            direction="left"
            color={menuOpen ? "hsl(var(--popover))" : "hsl(var(--accent))"}
          />
        </div>
      </div>

      {/* dynamic menu --- shows up when clicking on the hamburger */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          menuOpen
            ? "max-h-screen opacity-100 transform scale-100"
            : "max-h-0 opacity-0 transform scale-95"
        }`}
      >
        {menuVisible && (
          <div className="flex flex-col items-stretch space-y-1 mb-4 text-background">
            <div className="w-full flex flex-col rounded-lg pb-3 pt-1 bg-accent border-b-4 border-popover">
              {navConfig.Categories.items!.map((item, index) => {
                return (
                  <div
                    key={item.title}
                    className={`rounded-md font-[Verdana] hover:text-popover ${
                      (index == 0 || index == 1) &&
                      `border-b-4 border-accent-foreground`
                    } ${index == 2 && `-mb-1`}`}
                  >
                    <NavLink
                      to={item.to || "/"}
                      className={({ isActive }) =>
                        `block text-lg px-8 py-1.5 text-end font-bold font-[Verdana] " ${
                          isActive ? "text-popover" : ""
                        }`
                      }
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.title.toUpperCase()}
                    </NavLink>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <CommonSearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
    </div>
  );
}
