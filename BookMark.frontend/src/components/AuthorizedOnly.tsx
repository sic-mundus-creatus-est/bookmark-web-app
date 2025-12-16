import { useAuth } from "@/lib/contexts/useAuth";
import { ShieldAlert } from "lucide-react";
import { Navigate } from "react-router-dom";

interface AuthorizedOnlyProps {
  children: React.ReactNode;
  role: string;
  redirect?: boolean;
  silent?: boolean;
  userId?: string;
}
export function AuthorizedOnly({
  children,
  role,
  redirect = false,
  silent = false,
  userId,
}: AuthorizedOnlyProps) {
  const { user } = useAuth();
  console.log("sub: " + user?.sub);
  console.log("url id: " + userId);
  if (user?.role?.includes(role) || (userId && user?.sub === userId)) {
    console.log("usao sam");
    return <>{children}</>;
  }

  if (redirect) return <Navigate to="/home" />;

  if (!silent)
    return (
      <div className="flex flex-col items-center text-red-700">
        <ShieldAlert size={40} />
        <span className="text-xl text-center font-[Candara]">
          You don’t have permission to view this content.
        </span>
      </div>
    );

  return null;
}
