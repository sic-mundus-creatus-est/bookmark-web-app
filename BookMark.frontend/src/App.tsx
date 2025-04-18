import { AuthProvider } from "@/lib/contexts/authContext";
import { AppRouter } from "@/routing/AppRouter";
import { RouterProvider } from "react-router-dom";

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={AppRouter} />
    </AuthProvider>
  );
}
