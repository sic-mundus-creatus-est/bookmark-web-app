import { RouterProvider } from "react-router-dom";

import { AuthProvider } from "@/lib/contexts/authProvider";
import { AppRouter } from "@/routing/AppRouter";

export function App() {
  return (
    <div style={{ minWidth: "clamp(21.5rem, 50vw, 100%)" }}>
      <AuthProvider>
        <RouterProvider router={AppRouter} />
      </AuthProvider>
    </div>
  );
}
