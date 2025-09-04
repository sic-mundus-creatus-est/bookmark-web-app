import React, { useEffect, useRef, useState } from "react";

interface BookTitleInputProps {
  value?: string;
  maxLength?: number;
  title?: string;
  placeholder?: string;
  onChange?: (newTitle: string) => void;
}
export function CommonNameTitleInput({
  value,
  maxLength = 128,
  title,
  placeholder,
  onChange,
}: BookTitleInputProps) {
  const [charCount, setCharCount] = useState(value?.length ?? 0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    resizeTextarea();

    const handleWindowResize = () => {
      resizeTextarea();
    };

    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, [value]);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCharCount(newValue.length);
    onChange?.(newValue);
    resizeTextarea();
  };

  return (
    <>
      <div className="relative flex-col items-center group">
        <textarea
          ref={textareaRef}
          title={title}
          placeholder={placeholder}
          spellCheck={false}
          rows={1}
          maxLength={maxLength}
          className="pl-2 bg-muted resize-none w-full text-2xl sm:text-2xl md:text-4xl lg:text-4xl
                      font-[Verdana] font-bold text-accent leading-tight focus:outline-none"
          value={value}
          onChange={handleChange}
        />
        {/* TL */}
        <span className="absolute -top-0.5 -left-0.5 w-2 h-2 border-t-2 border-l-2 border-accent group-focus-within:border-popover"></span>
        {/* TR */}
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 border-t-2 border-r-2 border-accent group-focus-within:border-popover"></span>
        {/* BL */}
        <span className="absolute bottom-0 -left-0.5 w-2 h-2 border-b-2 border-l-2 border-accent group-focus-within:border-popover"></span>
        {/* BR */}
        <span className="absolute bottom-0 -right-0.5 w-2 h-2 border-b-2 border-r-2 border-accent group-focus-within:border-popover"></span>
      </div>
      <div className="px-2 text-sm text-accent/60 font-mono text-right -mt-1">
        {charCount ?? 0}/{maxLength} characters
      </div>
    </>
  );
}
