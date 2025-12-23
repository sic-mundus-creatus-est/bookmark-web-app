interface NumberInputProps {
  value?: number;
  placeholder?: string;
  max?: number;
  onChange?: (value: number) => void;
}

function NumberInput({ value, placeholder, max, onChange }: NumberInputProps) {
  const currentYear = new Date().getFullYear();
  const maxDigits = max ? String(max).length : String(currentYear).length;

  const increase = () => {
    onChange?.((value ?? 0) + 1);
  };

  const decrease = () => {
    onChange?.((value ?? 0) > 0 ? (value ?? 0) - 1 : 0);
  };

  return (
    <div className="flex items-center">
      <input
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={value && value !== 0 ? String(value) : ""}
        onChange={(e) => {
          const rawValue = e.target.value.replace(/\D/g, ""); // only digits
          const trimmed = rawValue.slice(0, maxDigits);
          onChange?.(trimmed ? Number(trimmed) : 0);
        }}
        className="w-14 cursor-pointer focus:outline-none bg-transparent text-center text-xl rounded placeholder:italic placeholder-accent/50"
      />
      <div className="flex flex-col ml-1">
        <button
          type="button"
          onClick={increase}
          className="text-accent hover:text-popover text-xs leading-none"
          aria-label="Increase"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={decrease}
          className="text-accent hover:text-popover text-xs leading-none"
          aria-label="Decrease"
        >
          ▼
        </button>
      </div>
    </div>
  );
}

interface AuthorLifeRangeInputProps {
  birthYear?: number;
  deathYear?: number;
  onChange?: (range: { birthYear?: number; deathYear?: number }) => void;
}
export function AuthorLifeRangeInput({
  birthYear,
  deathYear,
  onChange,
}: AuthorLifeRangeInputProps) {
  const currentYear = new Date().getFullYear();

  const handleBirthYearChange = (newBirth?: number) => {
    onChange?.({
      birthYear: newBirth,
      deathYear,
    });
  };

  const handleDeathYearChange = (newDeath?: number) => {
    onChange?.({
      birthYear,
      deathYear: newDeath,
    });
  };

  return (
    <div className="font-[Georgia] text-xl text-accent flex items-center mb-2 space-x-2">
      (
      <NumberInput
        value={birthYear}
        placeholder="Born"
        max={currentYear}
        onChange={handleBirthYearChange}
      />
      {<span>&nbsp;</span>}
      –
      <NumberInput
        value={deathYear}
        placeholder="Died"
        max={currentYear}
        onChange={handleDeathYearChange}
      />
      )
    </div>
  );
}
