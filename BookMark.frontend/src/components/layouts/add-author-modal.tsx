import { useNavigate } from "react-router-dom";
import { useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { CircleUserRound, Plus, UserRoundPen, X } from "lucide-react";

import { createAuthor } from "@/lib/services/api-calls/authorService";

export function AddAuthorModal() {
  //-----------------------------------------------------------
  const [open, setOpen] = useState<boolean>(false);

  const [name, setName] = useState<string>("");
  const [birthDate, setBirthDate] = useState<string>("");
  const [deathDate, setDeathDate] = useState<string>("");
  const [biography, setBiography] = useState<string>("");

  const navigate = useNavigate();
  //-----------------------------------------------------------

  //==================================================
  const handleCreate = async () => {
    console.log({
      name,
      birthDate,
      deathDate,
      biography,
    });
    try {
      const result = await createAuthor({
        name: name,
        birthDate: birthDate,
        deathDate: deathDate,
        biography: biography,
      });

      if (result?.id) {
        setOpen(false);
        navigate(`/author/${result.id}`);
      }
    } catch (err) {
      console.error("Create author failed:", err);
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
          <UserRoundPen className="w-6 h-6" />
          <span className="text-sm font-bold text-background">Add Author</span>
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
                Add New Author
              </h1>
            </div>
          </Dialog.Title>

          <Dialog.Description />

          <div className="my-2 sm:mt-10 flex flex-col items-center sm:flex-row sm:items-start gap-6 text-accent justify-center">
            <div className="flex-shrink-0 flex flex-col items-center">
              <CircleUserRound
                size={100}
                strokeWidth={1}
                className="text-accent w-20 h-20 sm:w-auto sm:h-auto"
              />
              <span className="font-extrabold font-mono text-xl -mt-2">
                Author
              </span>
            </div>

            <div className="max-w-3xl">
              <div className="flex-shrink-0 flex justify-center sm:block -mt-4 sm:mt-0 mx-2 mb-1">
                <textarea
                  value={name}
                  onChange={(e) => handleResizeableTextArea(e, setName, 64)}
                  placeholder="Author's Name"
                  rows={1}
                  style={{ overflow: "hidden" }}
                  spellCheck={false}
                  className="w-full bg-muted resize-none border-l-2 border-accent rounded-lg focus:outline-none text-accent text-4xl font-semibold font-[Verdana] px-2"
                />
              </div>
              <div className="flex-shrink-0 flex justify-center sm:block">
                <div className="font-[Georgia] text-muted-foreground flex items-center mb-4 mx-2">
                  (
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="cursor-pointer focus:outline-none bg-transparent border-transparent border text-lg rounded w-36 mx-1"
                  />
                  –
                  <input
                    type="date"
                    value={deathDate}
                    onChange={(e) => setDeathDate(e.target.value)}
                    className="cursor-pointer focus:outline-none bg-transparent border-transparent border text-lg rounded w-36 mx-1"
                  />
                  )
                </div>
              </div>

              <AuthorDescriptionInput
                description={biography}
                setDescription={setBiography}
              />
            </div>
          </div>

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
  setValue: React.Dispatch<React.SetStateAction<string>>,
  maxLength: number
) {
  const textarea = e.target;
  const maxHeight = 250;

  if (textarea.value.length > maxLength) return;

  textarea.style.height = "auto";

  if (textarea.scrollHeight <= maxHeight) {
    textarea.style.overflowY = "hidden";
    textarea.style.height = textarea.scrollHeight + "px";
  } else {
    textarea.style.overflowY = "auto";
    textarea.style.height = maxHeight + "px";
  }

  setValue(textarea.value);
}

//---------------------------------------------------------------

interface AuthorDescriptionInputProps {
  description?: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  maxLength?: number;
}

function AuthorDescriptionInput({
  description,
  setDescription,
  maxLength = 4000,
}: AuthorDescriptionInputProps) {
  return (
    <div className="px-2">
      <textarea
        value={description}
        onChange={(e) => handleResizeableTextArea(e, setDescription, maxLength)}
        placeholder="Write a concise biography of the author..."
        rows={6}
        maxLength={maxLength}
        spellCheck={false}
        style={{ overflow: "hidden" }}
        className="w-full bg-background/50 text-accent resize-none focus:outline-none placeholder:text-accent/70 empty:before:content-[attr(data-placeholder)]
        before:text-accent/50 indent-4 text-base font-[Georgia] leading-tight rounded-lg p-2 px-3 border-2 border-b-4 border-accent break-words"
      />

      <div className="text-right text-sm text-accent/60 -mt-1 font-mono leading-tight">
        {description?.length || 0}/{maxLength} characters
      </div>
    </div>
  );
}
//==================================================================
