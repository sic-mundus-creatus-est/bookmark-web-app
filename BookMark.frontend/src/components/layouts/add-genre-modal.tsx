import { useNavigate } from "react-router-dom";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Tag, Tags, X } from "lucide-react";

import { createGenre } from "@/lib/services/api-calls/genreService";

export function AddGenreModal() {
  //-----------------------------------------------------------
  const [open, setOpen] = useState<boolean>(false);

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const navigate = useNavigate();
  //-----------------------------------------------------------

  //==================================================
  const handleCreate = async () => {
    console.log({
      name,
      description,
    });
    try {
      const result = await createGenre({
        name,
        description,
      });

      if (result?.id) {
        setOpen(false);
        navigate(`/genre/${result.id}`);
      }
    } catch (err) {
      console.error("Create genre failed:", err);
    }
  };
  //==================================================

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="flex items-center bottom-6 right-6 rounded-full px-3 py-2 gap-2 text-accent bg-popover border-accent border-2 border-b-4 hover:bg-popover/90 transition"
        >
          <Tags className="w-6 h-6" />
          <span className="text-sm font-bold text-background">Add Genre</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Overlay className="fixed inset-0 bg-accent-foreground/90 z-40" />

      <Dialog.Content className="fixed top-80 left-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] bg-muted border-2 border-accent rounded-lg rounded-t-3xl -translate-x-1/2 -translate-y-1/2 shadow-lg border-b-4">
        <Dialog.Close asChild>
          <button className="focus:outline-none absolute top-4 right-4 text-4xl text-muted hover:text-popover font-bold">
            <X strokeWidth={4} />
          </button>
        </Dialog.Close>

        <div className="py-b font-sans text-muted">
          <Dialog.Title>
            <div className="mb-4 bg-accent border-b-8 border-popover p-2 rounded-t-2xl rounded-b-sm">
              <h1 className="text-3xl font-bold font-[Verdana] px-2">
                Add New Genre
              </h1>
            </div>
          </Dialog.Title>

          <Dialog.Description />

          <div className="px-4">
            <textarea
              value={name}
              onChange={(e) => handleResizeableTextArea(e, setName)}
              placeholder="Genre's Name"
              rows={1}
              style={{ overflow: "hidden" }}
              spellCheck={false}
              className="w-full bg-muted resize-none border-l-2 border-accent rounded-lg focus:outline-none text-3xl text-accent leading-tight font-bold px-2 font-[Verdana]"
            />
          </div>

          <div className="flex items-center text-sm px-4 text-accent/50 leading-tight pb-2">
            <Tag className="mr-1 w-4 h-4 text-accent" />
            <span className="hover:underline cursor-pointer">Genres</span>
            <span className="px-1">›</span>
            <span className="text-popover font-semibold">{name}</span>
          </div>

          <GenreDescriptionInput
            description={description}
            setDescription={setDescription}
          />

          <div className="flex justify-end px-8 my-2">
            <button
              onClick={handleCreate}
              className="flex items-center gap-1 bg-accent text-background font-bold px-3 py-2 rounded-lg transition border-b-4 border-popover hover:text-popover"
              type="button"
            >
              <Plus className="text-popover" strokeWidth={3} />
              Add
            </button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}

//==================================================================
function handleResizeableTextArea(
  e: React.ChangeEvent<HTMLTextAreaElement>,
  setValue: React.Dispatch<React.SetStateAction<string>>
) {
  const textarea = e.target;
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
  setValue(textarea.value);
}

//---------------------------------------------------------------

interface GenreDescriptionInputProps {
  description?: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
}
function GenreDescriptionInput({
  description,
  setDescription,
}: GenreDescriptionInputProps) {
  return (
    <div className="px-4">
      <textarea
        value={description}
        onChange={(e) => handleResizeableTextArea(e, setDescription)}
        placeholder="Write a brief description of the genre..."
        rows={6}
        style={{ overflow: "hidden" }}
        spellCheck={false}
        className="w-full text-accent resize-none focus:outline-none placeholder:text-accent/70 empty:before:content-[attr(data-placeholder)] before:text-accent/50 indent-4 text-base font-[Georgia] leading-tight rounded-lg bg-muted p-2 px-3 border-2 border-b-4 border-accent break-words"
      />
    </div>
  );
}
//==================================================================
