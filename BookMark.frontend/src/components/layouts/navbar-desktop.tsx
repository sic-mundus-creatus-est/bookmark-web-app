import { SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import Logo from "@/components/logo";
import { ContentRow } from "./navbar";

export function DesktopNavbar() {
  return (
    <div className="hidden lg:flex flex-1 items-center justify-between px-40">
      <div className="flex flex-col">
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

function SearchBar() {
  return (
    <div className="relative flex items-center ml-auto mr-2 -mt-1">
      <Input
        placeholder="Search..."
        className="w-48 md:w-64 bg-muted pl-4 pr-12 text-accent rounded-lg border-b-2 border-accent"
      />
      <span className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-accent p-2 rounded-r-lg text-background hover:text-popover">
        <SearchIcon size={20} strokeWidth={3} />
      </span>
    </div>
  );
}
