import { Logo } from "@/components/logo";
import { navConfig } from "@/config/navConfig";
import { NavLink } from "react-router-dom";
import { CommonSearchBox } from "../ui/common/common-search-box";

export function DesktopNavbar() {
  return (
    <div className="hidden lg:flex flex-1 items-center justify-between">
      <div className="flex flex-col -ml-1.5">
        <Logo />
        <div className="container mx-auto pl-14 -mt-1.5">
          <ContentRow />
        </div>
      </div>

      <CommonSearchBox className="-mt-3.5" />
    </div>
  );
}

export function ContentRow() {
  const contentLinks = navConfig.Categories.items;

  return (
    <div className="flex text-md flex-wrap font-bold text-accent gap-5">
      {contentLinks?.map((item) => (
        <div key={item.title} className="flex items-center space-x-5">
          <NavLink
            aria-label={item.title}
            to={item.to!}
            className={({ isActive }) =>
              `hover:scale-105 hover:text-popover ${
                isActive ? "font-extrabold text-popover" : ""
              }`
            }
          >
            {item.title}
          </NavLink>
        </div>
      ))}
    </div>
  );
}
