import { AuthProvider } from "@/contexts/authContext";
import AppRouter from "@/routing/AppRouter";

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
