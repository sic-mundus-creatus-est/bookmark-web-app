import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/contexts/useAuth";

export function PrivateRoute({
  component: Component,
}: {
  component: React.FC;
}) {
  const auth = useAuth();
  const location = useLocation();

  if (auth.loading) {
    return <p className="text-accent text-center text-xl">Loading...</p>;
  }

  if (!auth.user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <Component />;
}
