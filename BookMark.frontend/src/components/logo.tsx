import { Bookmark } from "lucide-react";
import { NavLink } from "react-router-dom";

import { appConfig } from "@/config/appConfig";
import { navConfig } from "@/config/navConfig";

export function Logo() {
  return (
    <NavLink
      to={navConfig.Home.to!}
      className="flex items-center z-50 text-4xl text-accent font-extrabold select-none"
    >
      <Bookmark size={47} strokeWidth={3} className="text-popover" />
      {appConfig.name.toUpperCase()}
    </NavLink>
  );
}
