import React, { useCallback, useEffect, useRef, useState } from "react";

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
  //---------------------------------------------------------------------
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  //---------------------------------------------------------------------
  const [charCount, setCharCount] = useState(value?.length ?? 0);
  const [showPassword, setShowPassword] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  //---------------------------------------------------------------------
  const resizeTextarea = useCallback(() => {
    if (!singleLine && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [singleLine]);
  //---------------------------------------------------------------------
  useEffect(() => {
    if (value) setCharCount(value.length);
  }, [value]);

  useEffect(() => {
    resizeTextarea();
  }, [value, displayValue, resizeTextarea]);

  useEffect(() => {
    window.addEventListener("resize", resizeTextarea);
    return () => window.removeEventListener("resize", resizeTextarea);
  }, [resizeTextarea]);

  useEffect(() => {
    if (isSecret) {
      setDisplayValue(showPassword ? value : "•".repeat(value.length));
    } else {
      setDisplayValue(value);
    }
  }, [value, showPassword, isSecret]);
  //---------------------------------------------------------------------

  //=====================================================================
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newValue = e.target.value;

    if (isSecret && !showPassword) {
      const currentLength = value.length;

      // backspace/delete
      if (newValue.length < currentLength) {
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
    setCharCount(newValue.length);
  }; //=====================================================================

  return (
    <div className="flex flex-col">
      <h6 className="text-accent text-xs font-mono font-bold select-none">
        {label}
      </h6>
      <div className="relative flex-col items-center group">
        <div className={`relative ${isSecret ? "pr-10" : ""}`}>
          <textarea
            ref={textareaRef}
            title={title}
            placeholder={placeholder}
            spellCheck={false}
            rows={1}
            maxLength={maxLength ?? undefined}
            value={displayValue}
            onChange={handleChange}
            className={`pl-2 py-2 bg-muted resize-none w-full scrollbar-hide
                      font-[Verdana] font-bold text-accent leading-tight focus:outline-none
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
