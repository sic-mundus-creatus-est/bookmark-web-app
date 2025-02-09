import { AuthProvider } from "@/lib/contexts/authContext";
import { AppRouter } from "@/routing/AppRouter";
import { RouterProvider } from "react-router-dom";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={AppRouter} />
    </AuthProvider>
  );
}
