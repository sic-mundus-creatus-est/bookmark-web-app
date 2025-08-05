import React, { useEffect, useRef, useState } from "react";

interface BookDescriptionInputProps {
  rows?: number;
  value?: string;
  title?: string;
  maxLength?: number;
  placeholder?: string;
  onChange?: (value: string) => void;
}
export function BookDescriptionInput({
  rows = 6,
  value,
  title = "Enter Book's Description",
  maxLength = 4000,
  placeholder = "Description...",
  onChange,
}: BookDescriptionInputProps) {
  const [charCount, setCharCount] = useState(value?.length ?? 0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function adjustHeight() {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newValue = e.target.value;
    setCharCount(newValue.length);
    onChange?.(newValue);
    requestAnimationFrame(adjustHeight);
  }

  function handlePaste() {
    requestAnimationFrame(adjustHeight);
  }

  useEffect(() => {
    adjustHeight();
  }, [value]);

  useEffect(() => {
    window.addEventListener("resize", adjustHeight);
    return () => {
      window.removeEventListener("resize", adjustHeight);
    };
  }, []);

  return (
    <>
      <textarea
        ref={textareaRef}
        title={title}
        value={value}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        spellCheck={false}
        style={{ overflow: "hidden" }}
        className="px-2 resize-none focus:outline-none border-b-2 rounded-lg bg-accent/10 border-accent text-lg leading-relaxed text-accent font-[Georgia] indent-4
        text-balance placeholder:text-accent/70 whitespace-normal break-words w-full min-w-[2ch] empty:before:content-[attr(data-placeholder)] before:text-accent/50"
      />
      <div className="text-right -mt-4 text-sm text-accent/60 font-mono leading-tight">
        {charCount}/{maxLength} characters
      </div>
    </>
  );
}
