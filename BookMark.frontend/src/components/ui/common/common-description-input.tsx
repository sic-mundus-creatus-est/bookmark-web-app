interface AuthorDescriptionInputProps {
  rows?: number;
  label?: string;
  labelStyle?: React.CSSProperties;
  value?: string;
  title?: string;
  maxLength?: number;
  textSize?: number;
  placeholder?: string;
  onChange?: (value: string) => void;
}
export function CommonDescriptionInput({
  rows = 6,
  label,
  labelStyle,
  value,
  title,
  maxLength = 4000,
  textSize,
  placeholder,
  onChange,
}: AuthorDescriptionInputProps) {
  const charCount = value?.length ?? 0;

  return (
    <div className="flex flex-col">
      <label
        htmlFor={label}
        style={labelStyle}
        className="pl-3 text-accent text-[14px] font-mono font-bold select-none -mb-1"
      >
        {label}
      </label>
      <textarea
        id={label}
        value={value ?? undefined}
        title={title}
        onChange={(e) => {
          onChange?.(e.target.value);
        }}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        spellCheck={false}
        style={{ overflowY: "auto", fontSize: textSize ?? undefined }}
        className={`w-full bg-muted focus-within:border-popover text-accent resize-none focus:outline-none placeholder:text-accent/45
                    indent-4 text-lg font-[Georgia] leading-tight rounded-lg p-2 border-2 border-b-4 border-accent break-words focus:rounded-lg
                    ${textSize ? "" : "text-lg"}`}
      />

      <div className="text-right text-sm text-accent/60 font-mono leading-tight mr-1">
        {charCount}/{maxLength} characters
      </div>
    </div>
  );
}
