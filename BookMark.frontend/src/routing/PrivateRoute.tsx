import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/lib/contexts/authContext";

export default function PrivateRoute({
  component: Component,
}: {
  component: React.FC;
}) {
  const auth = useContext(AuthContext);

  if (!auth || auth.loading) {
    return <p>Loading...</p>;
  }

  console.log("Auth Context: ", auth);

  return auth.user ? <Component /> : <Navigate to="/login" />;
}
