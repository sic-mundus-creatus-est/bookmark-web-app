import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Eye, EyeOff } from "lucide-react";

interface CommonTextInputProps {
  label?: string;
  value?: string;
  maxLength?: number;
  showCharCount?: boolean;
  title?: string;
  placeholder?: string;
  fontSize?: number;
  singleLine?: boolean;
  isSecret?: boolean;
  noBreaks?: boolean;
  onChange?: (newValue: string) => void;
}

export function CommonTextInput({
  label,
  value = "",
  maxLength,
  showCharCount,
  title,
  placeholder,
  fontSize,
  singleLine = false,
  isSecret = false,
  noBreaks = false,
  onChange,
}: CommonTextInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPassword, setShowPassword] = useState(false);

  // caret position tracker
  const caretPos = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

  const resizeTextarea = useCallback(() => {
    if (!singleLine && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [singleLine]);

  useEffect(() => {
    window.addEventListener("resize", resizeTextarea);
    return () => window.removeEventListener("resize", resizeTextarea);
  }, [resizeTextarea]);

  useLayoutEffect(() => {
    // caret restore after value update
    if (textareaRef.current)
      textareaRef.current.setSelectionRange(
        caretPos.current.start,
        caretPos.current.end
      );
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { selectionStart, selectionEnd } = e.target;
    caretPos.current = { start: selectionStart, end: selectionEnd };

    let newValue = e.target.value;

    if (isSecret && !showPassword) {
      const currentLength = value.length;

      if (newValue.length < currentLength) {
        // backspace/delete
        newValue = value.slice(0, newValue.length);
      } else {
        // typing
        newValue = value + newValue.slice(currentLength);
      }
    }

    if (noBreaks) {
      newValue = newValue.replace(/[ \n\r]/g, "");
    }

    onChange?.(newValue);
    requestAnimationFrame(resizeTextarea);
  };

  const displayValue =
    isSecret && !showPassword ? "•".repeat(value.length) : value;
  const charCount = value.length ?? 0;

  return (
    <div className="flex flex-col">
      <label
        htmlFor={label}
        className="text-accent text-xs font-mono font-bold select-none"
      >
        {label}
      </label>
      <div className="relative flex-col items-center group">
        <div className={`relative ${isSecret ? "pr-10" : ""}`}>
          <textarea
            id={label}
            ref={textareaRef}
            title={title}
            placeholder={placeholder}
            spellCheck={false}
            rows={1}
            maxLength={maxLength ?? undefined}
            value={displayValue}
            onChange={handleChange}
            className={`pl-2 py-2 bg-muted resize-none w-full scrollbar-hide placeholder:text-accent/45
                      font-[Verdana] font-bold text-accent leading-tight focus:outline-none focus:text-popover
                      ${fontSize ? "" : "text-2xl md:text-4xl"}
                      ${singleLine ? "overflow-x-auto whitespace-nowrap" : ""}
                      ${isSecret ? "pr-10" : ""}`}
            style={fontSize ? { fontSize } : undefined}
            wrap={singleLine ? "off" : undefined}
            onKeyDown={(e) => {
              if (singleLine && e.key === "Enter") {
                e.currentTarget.form?.requestSubmit();
              }
            }}
          />
        </div>
        {isSecret && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-accent/60 text-sm font-mono hover:text-popover"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <Eye /> : <EyeOff />}
          </button>
        )}
        {/* TL */}
        <span className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t-2 border-l-2 border-accent group-focus-within:border-popover"></span>
        {/* TR */}
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 border-t-2 border-r-2 border-accent group-focus-within:border-popover"></span>
        {/* BL */}
        <span className="absolute -bottom-[1px] -left-0.5 w-2 h-2 border-b-2 border-l-2 border-accent group-focus-within:border-popover"></span>
        {/* BR */}
        <span className="absolute -bottom-[1px] -right-0.5 w-2 h-2 border-b-2 border-r-2 border-accent group-focus-within:border-popover"></span>
      </div>
      {maxLength && showCharCount ? (
        <div className="px-2 text-sm text-accent/60 font-mono text-right -mt-1">
          {charCount ?? 0}/{maxLength}
          {!singleLine ? " characters" : ""}
        </div>
      ) : null}
    </div>
  );
}
