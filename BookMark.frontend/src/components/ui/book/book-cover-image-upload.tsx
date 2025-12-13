import { useEffect, useState } from "react";

import { ImageUp, X } from "lucide-react";

interface BookCoverImageUploadProps {
  value?: string | null;
  accept?: string;
  onChange?: (file: File | null) => void;
}

export function BookCoverImageUpload({
  value,
  accept = ".jpg,.jpeg,.png",
  onChange,
}: BookCoverImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(value ?? "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onChange?.(file);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewUrl("");
    onChange?.(null);
  };

  useEffect(() => {
    return () => {
      // to avoid memory leaks
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <label
      title="Upload Cover"
      htmlFor="cover-image-upload"
      className="cursor-pointer block w-full h-full"
    >
      <input
        id="cover-image-upload"
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="relative w-full h-full">
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Cover Preview"
              className="w-full h-full rounded-t-lg border-t-2 border-x-2 border-accent bg-accent/95"
            />

            <button
              title="Remove Cover"
              className="absolute top-1 right-1 bg-accent text-muted hover:text-red-500 rounded-full p-1  m-1 shadow-md border-popover border-2"
              onClick={handleRemoveImage}
            >
              <X size={17} strokeWidth={3} />
            </button>
          </>
        ) : (
          <img
            src="/placeholder-image-vertical.png"
            className="w-full h-full rounded-t-lg border-t-2 border-x-2 border-accent bg-accent/95"
            alt="Placeholder"
          />
        )}
      </div>
    </label>
  );
}

interface UploadLabelProps {
  accept?: string;
}
export function UploadLabel({
  accept = ".jpg, .jpeg, .png",
}: UploadLabelProps) {
  return (
    <label
      title="Upload Cover"
      htmlFor="cover-image-upload"
      className="cursor-pointer block w-full h-full"
    >
      <div className="flex justify-center mx-10 pt-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-5">
            <div className="inline-block w-[calc(5ch+0.5rem)] pl-4 text-3xl font-[Candara] font-bold">
              Upload
            </div>
            <div className="text-4xl text-popover inline-flex items-center justify-center w-[calc(3ch+0.5rem)]">
              <ImageUp size={28} />
            </div>
          </div>

          <div className="pl-2 -mt-2">
            <span className="text-xs font-mono text-background">{accept}</span>
          </div>
        </div>
      </div>
    </label>
  );
}
