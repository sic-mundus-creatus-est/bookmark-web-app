import { BookRatingInput } from "../ui/book/book-rating-input";
import { CommonDescriptionInput } from "../ui/common/common-description-input";
import { CommonSubmitButton } from "../ui/common/common-submit-button";

interface PostReviewFormProps {
  subjectTitle?: string;
  rating?: number;
  content?: string;
  onRatingChange?: (value: number) => void;
  onContentChange?: (value: string) => void;
  onSubmit?: () => void;
}
export function PostReviewForm({
  subjectTitle = "it",
  rating,
  content,
  onRatingChange,
  onContentChange,
  onSubmit,
}: PostReviewFormProps) {
  return (
    <div className="p-2 px-3 rounded-b-xl rounded-t-md border-b-8 border-2 border-accent bg-muted">
      <h5 className="text-xl font-semibold leading-tight">
        What would you rate{" "}
        <span className="italic text-popover font-bold">{subjectTitle}</span>?
      </h5>
      <div className="px-2 flex justify-end">
        <BookRatingInput value={rating} size={30} onChange={onRatingChange} />
      </div>
      <h5 className="text-xl font-semibold -mt-7">
        What did you think of{" "}
        <span className="text-popover font-bold italic">it</span>?
      </h5>
      <div className="pl-2 mt-1">
        <CommonDescriptionInput
          value={content}
          rows={8}
          maxLength={2000}
          onChange={onContentChange}
        />
      </div>
      <div className="flex justify-end mt-2">
        <CommonSubmitButton label="Post Review" onClick={onSubmit} />
      </div>
    </div>
  );
}
