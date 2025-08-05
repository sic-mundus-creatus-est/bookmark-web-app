interface PublicationYearSelectorProps {
  value?: number;
  earliestYearOption?: number;
  onChange?: (year: number) => void;
}
export function PublicationYearSelector({
  value,
  earliestYearOption = 0,
  onChange,
}: PublicationYearSelectorProps) {
  const currentYear = new Date().getFullYear();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = Number(e.target.value);
    onChange?.(year);
  };

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
          value={value}
          onChange={handleChange}
        >
          <option value="-1" className="text-accent/50 bg-accent/20">
            year
          </option>
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
