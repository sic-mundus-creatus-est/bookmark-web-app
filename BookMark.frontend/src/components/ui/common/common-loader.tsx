import { useLoading } from "@/lib/contexts/useLoading";

export function CommonLoader() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-background">
      <div className="flex space-x-2">
        <span className="w-4 h-4 bg-accent rounded-full animate-bounce"></span>
        <span className="w-4 h-4 bg-accent rounded-full animate-bounce [animation-delay:0.2s]"></span>
        <span className="w-4 h-4 bg-accent rounded-full animate-bounce [animation-delay:0.4s]"></span>
      </div>
    </div>
  );
}
