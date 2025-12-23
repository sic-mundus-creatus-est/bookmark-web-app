import { useNavigate } from "react-router-dom";
import { useState } from "react";

import * as Dialog from "@radix-ui/react-dialog";
import { UserRoundPen, X } from "lucide-react";

import {
  CommonErrorLabel,
  CommonSubmitButton,
} from "../ui/common/common-submit-button";
import { CommonTextInput } from "../ui/common/common-text-input";
import { CommonDescriptionInput } from "../ui/common/common-description-input";
import { AuthorLifeRangeInput } from "../ui/author/author-life-range-input";
import { useCreateAuthor } from "@/lib/services/api-calls/hooks/useAuthorApi";
import { ApiError } from "@/lib/services/api-calls/api";
import { AuthorSchema } from "@/lib/services/form-validation-schemas/authorSchema";

export function AddAuthorModal() {
  //-----------------------------------------------------------
  const [open, setOpen] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>();

  const [name, setName] = useState<string>("");
  const [birthYear, setBirthYear] = useState<number>();
  const [deathYear, setDeathYear] = useState<number>();
  const [biography, setBiography] = useState<string>();

  const navigate = useNavigate();
  //-----------------------------------------------------------

  //==================================================
  const createAuthor = useCreateAuthor();
  const handleCreate = async () => {
    const formDataValidation = AuthorSchema.safeParse({
      name,
      birthYear,
      deathYear,
      biography,
    });
    if (!formDataValidation.success) {
      setFormError(formDataValidation.error.issues[0]?.message);
      return;
    }

    createAuthor.mutate(
      {
        name: name,
        birthYear: birthYear,
        deathYear: deathYear,
        biography: biography,
      },
      {
        onError: (error: ApiError) => {
          if (error.detail) setFormError(error.detail);
        },
        onSuccess: (result) => {
          setOpen(false);
          navigate(`/author/${result.id}`);
        },
      }
    );
  };
  //==================================================

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="flex items-center bottom-6 right-6 rounded-full px-3 py-2 gap-2 text-accent bg-popover border-accent border-2 border-b-4 hover:bg-popover/90 transition"
          aria-label="Add Author"
        >
          <UserRoundPen className="w-6 h-6" />
          <span className="text-sm font-bold text-background">Add Author</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Overlay className="fixed inset-0 bg-accent-foreground/90 z-50" />

      <Dialog.Content
        data-testid="author-modal"
        className="fixed top-80 left-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] bg-muted border-2 border-accent rounded-lg rounded-t-3xl -translate-x-1/2 -translate-y-1/2 shadow-lg border-b-4"
        style={{ minWidth: "clamp(21.5rem, 50vw, 100%)" }}
      >
        <Dialog.Close asChild>
          <button className="focus:outline-none absolute top-4 right-4 text-4xl text-popover hover:text-red-500 font-bold">
            <X strokeWidth={4} />
          </button>
        </Dialog.Close>

        <div className="font-sans text-muted">
          <Dialog.Title>
            <div className="mb-4 bg-accent border-b-8 border-popover p-2 rounded-t-2xl rounded-b-sm">
              <h1 className="text-3xl font-bold font-[Verdana] px-2">
                Add New Author
              </h1>
            </div>
          </Dialog.Title>

          <Dialog.Description />

          <div className="mx-6">
            <CommonTextInput
              label="Name"
              value={name}
              maxLength={64}
              title="Name"
              placeholder="Name"
              showCharCount
              fontSize={24}
              onChange={setName}
            />

            <AuthorLifeRangeInput
              birthYear={birthYear}
              deathYear={deathYear}
              onChange={({ birthYear, deathYear }) => {
                setBirthYear(birthYear);
                setDeathYear(deathYear);
              }}
            />

            <CommonDescriptionInput
              value={biography}
              onChange={setBiography}
              placeholder="Write a concise biography of the author..."
            />

            <div className="mt-4 mb-2">
              {formError && <CommonErrorLabel error={formError} />}
              <div className="flex justify-end">
                <CommonSubmitButton label="Add" onClick={handleCreate} />
              </div>
            </div>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
