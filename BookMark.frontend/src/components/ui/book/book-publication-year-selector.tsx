interface PublicationYearSelectorProps {
  publicationYear: number;
  setPublicationYear: (year: number) => void;
  earliestYearOption?: number;
}

export function PublicationYearSelector({
  publicationYear,
  setPublicationYear,
  earliestYearOption = 1000,
}: PublicationYearSelectorProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="col-span-2 bg-background px-2 py-2 rounded">
      <div className="grid grid-cols-[auto_1fr] gap-x-4 items-center">
        <div className="uppercase text-accent font-bold tracking-wider whitespace-nowrap">
          Published in:
        </div>
        <select
          title="Publication Year"
          className="bg-background text-accent px-2 py-1 rounded border-b-2 border-accent/50 focus:outline-none focus:border-accent cursor-pointer"
          style={{ width: "fit-content" }}
          value={publicationYear}
          onChange={(e) => setPublicationYear(Number(e.target.value))}
        >
          {Array.from(
            { length: currentYear - earliestYearOption + 1 },
            (_, i) => {
              const year = currentYear - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            }
          )}
        </select>
      </div>
    </div>
  );
}
