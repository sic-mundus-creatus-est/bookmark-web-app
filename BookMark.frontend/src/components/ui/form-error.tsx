interface FormErrorProps {
  message?: string | null;
  className?: string;
}
export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;
  console.log(message);

  return (
    <div
      className={`text-red-500 font-mono italic font-bold text-sm mb-1 text-right -mt-2 ${
        className ?? ""
      }`}
    >
      {message}
    </div>
  );
}
