import { Bookmark } from "lucide-react";
import { NavLink } from "react-router-dom";

import { appConfig } from "@/config/appConfig";
import { navConfig } from "@/config/navConfig";

export default function Logo() {
  return (
    <NavLink
      to={navConfig.Home.to!}
      className="text-4xl font-extrabold font-sans flex items-center select-none"
    >
      <Bookmark size={47} strokeWidth={3} />
      {appConfig.name.toUpperCase()}
    </NavLink>
  );
}
