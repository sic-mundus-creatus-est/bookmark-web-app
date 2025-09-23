import { Bookmark } from "lucide-react";
import { Link } from "react-router-dom";

import { appConfig } from "@/config/appConfig";
import { navConfig } from "@/config/navConfig";

export function Logo() {
  return (
    <Link
      to={navConfig.Home.to!}
      className="flex items-center text-4xl text-accent font-extrabold select-none"
    >
      <Bookmark size={47} strokeWidth={3} className="text-popover" />
      {appConfig.name.toUpperCase()}
    </Link>
  );
}
