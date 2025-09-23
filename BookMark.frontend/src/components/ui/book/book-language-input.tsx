interface BookLanguageInputProps {
  value?: string;
  maxLength?: number;
  onChange?: (value: string) => void;
}
export function BookLanguageInput({
  value = "",
  maxLength = 64,
  onChange,
}: BookLanguageInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange?.(newValue);
  };

  return (
    <div className="col-span-2 bg-background px-2 py-2 rounded">
      <div className="grid grid-cols-[auto_1fr] gap-x-4 items-center">
        <div className="uppercase text-accent font-bold tracking-wider whitespace-nowrap">
          Written in:
        </div>
        <input
          type="text"
          title="Original Language"
          placeholder="Language"
          className="px-1 my-1 text-md uppercase text-accent bg-transparent focus:outline-none border-b-2 border-accent/50 w-full"
          value={value}
          maxLength={maxLength}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
