import { useState } from "react";

import { X, Plus } from "lucide-react";

import { GenreLinkProps } from "@/lib/types/genre";
import { BookGenreSelector } from "@/components/ui/book/book-genre-selector";

interface BookGenreEntriesProps {
  initialGenres?: GenreLinkProps[];
  allGenres?: GenreLinkProps[];
  onChange?: (genres: GenreLinkProps[]) => void;
}
export function BookGenreEntries({
  initialGenres = [],
  allGenres = [],
  onChange,
}: BookGenreEntriesProps) {
  const [selectedGenres, setSelectedGenres] = useState<GenreLinkProps[]>(
    initialGenres ?? []
  );

  const handleAddGenre = () => {
    const firstUnselected = allGenres.find(
      (g) => !selectedGenres.some((sg) => sg.id === g.id)
    );

    if (firstUnselected) {
      const updated = [...selectedGenres, firstUnselected];
      setSelectedGenres(updated);
      onChange?.(updated);
    }
  };

  const handleChangeGenre = (index: number, newGenre: GenreLinkProps) => {
    if (selectedGenres.some((g) => g.id === newGenre.id)) return;
    const updated = [...selectedGenres];
    updated[index] = newGenre;
    setSelectedGenres(updated);
    onChange?.(updated);
  };

  const handleRemoveGenre = (index: number) => {
    const updatedSelectedGenres = [
      ...selectedGenres.slice(0, index),
      ...selectedGenres.slice(index + 1),
    ];
    setSelectedGenres(updatedSelectedGenres);
    onChange?.(updatedSelectedGenres);
  };

  return (
    <div className="flex flex-wrap items-start gap-3 text-sm font-[Verdana] pl-2">
      <div className="flex flex-wrap gap-1.5 gap-y-3.5">
        <div className="uppercase text-accent font-bold tracking-wider pt-1 whitespace-nowrap">
          Genres:
        </div>
        {selectedGenres.map((genre, i) => (
          <div key={i} className="inline-flex items-center gap-x-0.5">
            <BookGenreSelector
              genre={genre}
              allGenres={allGenres}
              selectedGenres={selectedGenres}
              onChange={(newGenre) => handleChangeGenre(i, newGenre)}
            />
            <button
              title="Remove Genre"
              onClick={() => handleRemoveGenre(i)}
              className="text-popover hover:text-red-700 font-bold rounded focus:outline-none -ml-1"
            >
              <X strokeWidth={4} />
            </button>
          </div>
        ))}
      </div>

      {allGenres?.length > 0 && selectedGenres.length !== allGenres.length && (
        <div className="flex justify-end w-full">
          <button
            onClick={handleAddGenre}
            className="text-background font-bold flex items-center justify-center font-[Verdana] text-sm p-1 bg-accent rounded-full hover:text-popover -mb-3 -mt-1"
            aria-label="Add genre"
            type="button"
          >
            <Plus strokeWidth={4} size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
