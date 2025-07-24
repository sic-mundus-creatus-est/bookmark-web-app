import React, { useEffect, useRef, useState } from "react";

interface BookTitleInputProps {
  maxLength?: number;
  onChange?: (value: string) => void;
}
export function BookTitleInput({
  maxLength = 128,
  onChange,
}: BookTitleInputProps) {
  const [title, setTitle] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    resizeTextarea();

    const handleWindowResize = () => {
      resizeTextarea();
    };

    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, [title]);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setTitle(newValue);
    if (onChange) onChange(newValue);
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
        value={title}
        onChange={handleChange}
      />
      <div className="px-1 text-sm text-accent/60 -mt-1 font-mono">
        {title.length}/{maxLength} characters
      </div>
    </div>
  );
}
