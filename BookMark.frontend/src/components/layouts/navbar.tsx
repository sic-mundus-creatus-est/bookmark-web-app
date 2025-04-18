import { LogIn, UserPlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

import { DesktopNavbar } from "@/components/layouts/navbar-desktop";
import { MobileNavbar } from "@/components/layouts/navbar-mobile";
import { navConfig } from "@/config/navConfig";

export function Navbar() {
  return (
    <nav className="sticky top-0 bottom-0 w-full bg-border z-50">
      <AuthRow />

      <div className="container mx-auto flex items-center justify-between px-4">
        <DesktopNavbar />
        <MobileNavbar />
      </div>

      <div className="bg-secondary pt-2 pb-2">
        <div className="container mx-auto flexpx-4 md:px-8">
          <ContentRow />
        </div>
      </div>
    </nav>
  );
}

function AuthRow() {
  return (
    <div className="pt-2 pb-1">
      <div className="container mx-auto flex justify-end px-4 md:px-8 space-x-4 flex-wrap">
        {navConfig.Auth.items?.map((item) => {
          const Icon = item.icon === "log-in" ? LogIn : UserPlus;
          return (
            <a
              href={item.to}
              className="flex items-center text-sm mb-2 md:mb-0"
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

function ContentRow() {
  const contentLinks = navConfig.Content.items;

  return (
    <div className="flex pl-7 lg:pl-0 sm:pl-4 space-x-4 text-gray-600 text-sm flex-wrap font-serif">
      {contentLinks?.map((item, index) => (
        <div key={item.title} className="flex items-center space-x-4">
          <a href={item.to || item.href}>{item.title}</a>
          {index < contentLinks.length - 1 && (
            <Separator orientation="vertical" />
          )}
        </div>
      ))}
    </div>
  );
}
