import { SearchIcon } from "lucide-react";

import { navConfig } from "@/config/navConfig";
import { Input } from "@/components/ui/input";
import Logo from "@/components/logo";

export default function DesktopNavbar() {
  return (
    <div className="hidden lg:flex flex-1 items-center justify-between pb-5">
      <Logo />
      <div className="flex-1 flex justify-center">
        <NavLinks />
      </div>
      <SearchBar />
    </div>
  );
}

function NavLinks() {
  return (
    <div className="mx-auto bg-card rounded-2xl px-2 py-2">
      <div className="flex text-lg">
        {navConfig.Categories.items?.map((item, index) => (
          <div key={item.title} className="flex items-center">
            <a
              href={item.to}
              className="font-bold px-4 rounded-2xl hover:bg-gray-300"
            >
              {item.title.toUpperCase()}
            </a>

            {index < navConfig.Categories.items!.length - 1 && (
              <div className="border-l-4 bg-border h-7 rounded-2xl"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchBar() {
  return (
    <div className="relative flex items-center ml-auto mr-2">
      <Input
        placeholder="Search..."
        className="w-48 md:w-64 bg-secondary pl-4 pr-12"
      />
      <span className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-ring p-2 rounded-r-2xl text-white">
        <SearchIcon size={20} strokeWidth={3} />
      </span>
    </div>
  );
}
