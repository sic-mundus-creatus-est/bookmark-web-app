import React, { useEffect, useRef, useState } from "react";

interface BookTitleInputProps {
  value?: string;
  maxLength?: number;
  onChange?: (newTitle: string) => void;
}
export function BookTitleInput({
  value,
  maxLength = 128,
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
    <div>
      <textarea
        ref={textareaRef}
        title="Book's Title"
        placeholder="Title"
        spellCheck={false}
        rows={1}
        maxLength={maxLength}
        className="resize-none w-full text-2xl sm:text-2xl md:text-4xl lg:text-4xl xl:text-4xl font-[Verdana] font-bold text-accent leading-tight bg-transparent focus:outline-none"
        style={{ overflow: "hidden" }}
        value={value}
        onChange={handleChange}
      />
      <div className="px-1 text-sm text-accent/60 -mt-1 font-mono">
        {charCount ?? 0}/{maxLength} characters
      </div>
    </div>
  );
}
