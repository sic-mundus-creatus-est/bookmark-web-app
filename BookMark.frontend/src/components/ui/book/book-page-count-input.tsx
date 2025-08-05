import { ChangeEvent } from "react";

interface BookPageCountInputProps {
  value?: number;
  onChange: (count: number) => void;
}
export function BookPageCountInput({
  value = 0,
  onChange,
}: BookPageCountInputProps) {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value, 10);
    const validCount = Number.isNaN(num) ? 0 : Math.max(0, num);
    onChange?.(validCount);
  };

  const increase = () => {
    onChange?.(value + 1);
  };

  const decrease = () => {
    onChange?.(Math.max(0, value - 1));
  };

  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-4 items-center px-2">
      <div className="uppercase text-accent font-bold tracking-wider whitespace-nowrap">
        Pages:
      </div>
      <div className="flex items-center">
        <input
          type="text"
          inputMode="numeric"
          title="Number of Pages"
          className="bg-transparent text-accent text-md focus:outline-none px-1 border-b-2 border-accent/50 text-center"
          style={{ width: `${value.toString().length + 2}ch` }}
          value={value}
          onChange={handleInputChange}
        />
        <div className="flex flex-col">
          <button
            onClick={increase}
            className="text-accent/70 hover:text-accent text-xs leading-none"
            aria-label="Increase page count"
          >
            ▲
          </button>
          <button
            onClick={decrease}
            className="text-accent/70 hover:text-accent text-xs leading-none"
            aria-label="Decrease page count"
          >
            ▼
          </button>
        </div>
      </div>
    </div>
  );
}
