import { useState } from "react";

interface CommonDescriptionProps {
  value?: string;
  maxPreviewLength?: number;
}
export function CommonDescription({
  value,
  maxPreviewLength = 400,
}: CommonDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  const safeDescription = value?.trim() ? value : "No description...";

  const isLong = safeDescription.length > maxPreviewLength;
  const displayText =
    expanded || !isLong
      ? safeDescription
      : safeDescription.slice(0, maxPreviewLength);

  return (
    <p
      className="w-full indent-4 text-base font-[Georgia] leading-tight rounded-lg bg-muted p-2 border-2 border-b-4 border-accent break-words overflow-hidden whitespace-pre-line"
      style={{ cursor: isLong ? "pointer" : "default" }}
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
