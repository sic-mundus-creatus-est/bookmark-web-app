interface AuthorDescriptionInputProps {
  rows?: number;
  value?: string;
  title?: string;
  maxLength?: number;
  placeholder?: string;
  onChange?: (value: string) => void;
}
export function CommonDescriptionInput({
  rows = 6,
  value,
  title,
  maxLength = 4000,
  placeholder,
  onChange,
}: AuthorDescriptionInputProps) {
  const charCount = value?.length ?? 0;

  return (
    <div className="flex flex-col">
      <textarea
        value={value ?? undefined}
        title={title}
        onChange={(e) => {
          onChange?.(e.target.value);
        }}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        spellCheck={false}
        style={{ overflowY: "auto" }}
        className="w-full bg-muted focus-within:border-popover text-accent resize-none focus:outline-none placeholder:text-accent/45
        indent-4 text-lg font-[Georgia] leading-tight rounded-lg p-2 border-2 border-b-4 border-accent break-words"
      />

      <div className="text-right text-sm text-accent/60 font-mono leading-tight mr-1">
        {charCount}/{maxLength} characters
      </div>
    </div>
  );
}
