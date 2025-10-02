import { useState } from "react";

interface CommonDescriptionProps {
  value?: string;
  placeholder?: string;
  fontSize?: number;
  maxPreviewLength?: number;
  showBackground?: boolean;
}
export function CommonDescription({
  value,
  placeholder = "No description...",
  fontSize = 16,
  maxPreviewLength = 400,
  showBackground = true,
}: CommonDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  const safeDescription = value?.trim() ? value : placeholder;

  const isLong = safeDescription.length > maxPreviewLength;
  const displayText =
    expanded || !isLong
      ? safeDescription
      : safeDescription.slice(0, maxPreviewLength);

  return (
    <p
      className={`w-full indent-4 font-[Georgia] rounded-lg break-words overflow-hidden whitespace-pre-line ${
        showBackground ? "p-2 border-2 border-b-4 border-accent bg-muted" : ""
      }`}
      style={{ cursor: isLong ? "pointer" : "default", fontSize: fontSize }}
      onClick={() => isLong && setExpanded(!expanded)}
    >
      {displayText}
      {isLong && (
        <span className="text-accent font-bold ml-1 underline">
          {expanded ? "(less)" : "...more"}
        </span>
      )}
    </p>
  );
}
