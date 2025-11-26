import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../input";
import { SearchIcon } from "lucide-react";

interface CommonSearchBoxProps {
  searchRoute?: string;
  placeholder?: string;
  className?: string;
}
export function CommonSearchBox({
  searchRoute = "/all",
  placeholder = "Search by title, author or keyword...",
  className,
}: CommonSearchBoxProps) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    const trimmed = search.trim();
    if (trimmed.length > 0) {
      navigate(`${searchRoute}?search-term=${encodeURIComponent(trimmed)}`);
    } else {
      navigate(`${searchRoute}`);
    }

    setSearch("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className={`relative ${className ?? ""}`}>
      <Input
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        className="lg:w-96 bg-muted pl-4 pr-12 text-accent rounded-l-md border-b-4 border-accent caret-popover focus:border-popover focus-visible:ring-0"
      />
      <span
        onClick={handleSearch}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-accent p-2 rounded-r-lg text-background hover:text-popover cursor-pointer"
      >
        <SearchIcon size={20} strokeWidth={3} />
      </span>
    </div>
  );
}
