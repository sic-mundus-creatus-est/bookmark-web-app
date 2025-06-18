import { LogIn, UserPlus } from "lucide-react";

import { DesktopNavbar } from "@/components/layouts/navbar-desktop";
import { MobileNavbar } from "@/components/layouts/navbar-mobile";
import { navConfig } from "@/config/navConfig";

export function Navbar() {
  return (
    <nav className="sticky top-0 bottom-0 w-full bg-background z-50">
      <AuthRow />

      <div className="container mx-auto flex items-center justify-between px-4">
        <DesktopNavbar />
        <MobileNavbar />
      </div>
    </nav>
  );
}

function AuthRow() {
  return (
    <div className="pt-2">
      <div className="container mx-auto flex justify-end pr-10 sm:pr-10 md:pr-10 lg:pr-48 space-x-4 flex-wrap text-popover">
        {navConfig.Auth.items?.map((item) => {
          const Icon = item.icon === "log-in" ? LogIn : UserPlus;
          return (
            <a
              href={item.to}
              className="flex items-center text-sm font-semibold border-b-2 border-transparent hover:border-accent transition-colors duration-200"
              key={item.title}
            >
              <span className="mr-1">
                <Icon size={17} strokeWidth={2} />
              </span>
              {item.title}
            </a>
          );
        })}
      </div>
    </div>
  );
}
