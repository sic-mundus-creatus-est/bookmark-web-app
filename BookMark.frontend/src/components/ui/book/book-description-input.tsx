import React, { useEffect, useRef, useState } from "react";

interface BookDescriptionInputProps {
  maxLength?: number;
  onChange?: (value: string) => void;
}
export function BookDescriptionInput({
  maxLength = 4000,
  onChange,
}: BookDescriptionInputProps) {
  const [description, setDescription] = useState("");
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
    setDescription(newValue);
    onChange?.(newValue);
    requestAnimationFrame(adjustHeight);
  }

  function handlePaste() {
    requestAnimationFrame(adjustHeight);
  }

  useEffect(() => {
    adjustHeight();
  }, [description]);

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
        title="Enter Book's Description"
        value={description}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder="Description..."
        rows={6}
        maxLength={maxLength}
        spellCheck={false}
        style={{ overflow: "hidden" }}
        className="px-2 resize-none focus:outline-none border-b-2 rounded-lg bg-accent/10 border-accent text-lg leading-relaxed text-accent font-[Georgia] indent-4 text-balance placeholder:text-accent/70 whitespace-normal break-words w-full min-w-[2ch] empty:before:content-[attr(data-placeholder)] before:text-accent/50"
      />
      <div className="text-right -mt-4 text-sm text-accent/60 font-mono leading-tight">
        {description.length}/{4000} characters
      </div>
    </>
  );
}
