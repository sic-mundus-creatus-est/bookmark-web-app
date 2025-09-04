import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Logo } from "@/components/logo";
import { navConfig } from "@/config/navConfig";

export function DesktopNavbar() {
  return (
    <div className="hidden lg:flex flex-1 items-center justify-between">
      <div className="flex flex-col -ml-1.5">
        <Logo />
        <div className="bg-background">
          <div className="container mx-auto pl-14 -mt-1.5">
            <ContentRow />
          </div>
        </div>
      </div>

      <SearchBar />
    </div>
  );
}

export function ContentRow() {
  const contentLinks = navConfig.Categories.items;

  return (
    <div className="flex text-md flex-wrap font-bold text-popover gap-5">
      {contentLinks?.map((item) => (
        <div key={item.title} className="flex items-center space-x-5">
          <a
            href={item.to || item.href}
            className="hover:scale-105 hover:text-primary"
          >
            {item.title}
          </a>
        </div>
      ))}
    </div>
  );
}

function SearchBar() {
  return (
    <div className="relative flex items-center ml-auto -mt-1">
      <Input
        placeholder="Search..."
        className="w-48 md:w-64 bg-muted pl-4 pr-12 text-accent rounded-lg border-b-2 border-accent"
      />
      <span className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-accent p-2 rounded-r-lg text-background hover:text-popover cursor-pointer">
        <SearchIcon size={20} strokeWidth={3} />
      </span>
    </div>
  );
}
