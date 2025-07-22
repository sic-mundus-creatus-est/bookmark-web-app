interface BookLanguageInputProps {
  language: string;
  setLanguage: (value: string) => void;
}
export function BookLanguageInput({
  language,
  setLanguage,
}: BookLanguageInputProps) {
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
          value={language}
          maxLength={64}
          onChange={(e) => setLanguage(e.target.value)}
        />
      </div>
    </div>
  );
}
