import { ImageUp, X } from "lucide-react";

interface BookCoverImageUploadProps {
  coverImageFile: File | null;
  setCoverImageFile: (file: File | null) => void;
  setPreviewUrl: (coverUrl: string) => void;
}

export function BookCoverImageUpload({
  coverImageFile,
  setCoverImageFile,
  setPreviewUrl,
}: BookCoverImageUploadProps) {
  return (
    <label
      title="Upload Cover"
      htmlFor="cover-image-upload"
      className="cursor-pointer block w-full h-full"
    >
      <input
        id="cover-image-upload"
        type="file"
        accept=".jpg,.jpeg,.png"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setCoverImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
          }
        }}
        className="hidden"
      />
      <div className="relative w-full h-full">
        {coverImageFile ? (
          <>
            <img
              src={URL.createObjectURL(coverImageFile)}
              alt="Cover Preview"
              className="w-full h-full rounded-t-lg border-t-2 border-x-2 border-accent bg-accent/95"
            />

            <button
              title="Remove Cover"
              className="absolute top-1 right-1 bg-accent text-muted hover:text-red-500 rounded-full p-1  m-1 shadow-md border-popover border-2"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCoverImageFile(null);
                setPreviewUrl("");
              }}
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

export function UploadLabel() {
  return (
    <label
      title="Upload Cover"
      htmlFor="cover-image-upload"
      className="cursor-pointer block w-full h-full"
    >
      <div className="flex justify-center mx-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-5">
            <div className="inline-block w-[calc(5ch+0.5rem)] pl-4 text-3xl text-muted font-[Helvetica]">
              Upload
            </div>
            <div className="text-4xl text-popover inline-flex items-center justify-center w-[calc(3ch+0.5rem)]">
              <ImageUp size={28} />
            </div>
          </div>

          <div className="pl-2 -mt-2">
            <span className="text-xs font-mono text-background">
              .jpg, .jpeg, .png
            </span>
          </div>
        </div>
      </div>
    </label>
  );
}
