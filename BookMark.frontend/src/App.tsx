import { RouterProvider } from "react-router-dom";

import { AuthProvider } from "@/lib/contexts/authProvider";
import { AppRouter } from "@/routing/AppRouter";
import { LoadingProvider } from "./lib/contexts/loadingProvider";
import { CommonLoader } from "./components/ui/common/common-loader";

export function App() {
  return (
    <div style={{ minWidth: "clamp(21.5rem, 50vw, 100%)" }}>
      <LoadingProvider>
        <CommonLoader />
        <AuthProvider>
          <RouterProvider router={AppRouter} />
        </AuthProvider>
      </LoadingProvider>
    </div>
  );
}
