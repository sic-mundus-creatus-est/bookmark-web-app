import { useEffect, useState } from "react";

import { X, Plus } from "lucide-react";

import { Genre } from "@/lib/types/genre";
import { BookGenreSelector } from "@/components/ui/book/book-genre-selector";

interface BookGenreEntriesProps {
  fetchAllGenres: () => Promise<Genre[]>;
  onChange?: (genres: Genre[]) => void;
}
export function BookGenreEntries({
  fetchAllGenres,
  onChange,
}: BookGenreEntriesProps) {
  const [allGenres, setAllGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresResponse: Genre[] = await fetchAllGenres();

        setAllGenres(genresResponse);
      } catch (error: any) {
        console.error(
          `ERROR WHILE FETCHING GENRES:`,
          `\n----------------------------------`,
          `\n[${error.instance}]`,
          `\nError: ${error.status}`,
          `\n----------------------------------`,
          `\nType: ${error.type}`,
          `\nTitle: ${error.title}`,
          `\nDetail: ${error.detail}`,
          `\nTrace ID: ${error.traceId}`
        );
      }
    };

    fetchGenres();
  }, [fetchAllGenres]);

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

  const handleChangeGenre = (index: number, newGenre: Genre) => {
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
      <div className="uppercase text-accent font-bold tracking-wider pt-1 whitespace-nowrap">
        Genres:
      </div>

      <div className="flex flex-wrap gap-1">
        {selectedGenres.map((genre, i) => (
          <div key={i} className="inline-flex items-center gap-1">
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

      {selectedGenres.length !== allGenres.length && (
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
