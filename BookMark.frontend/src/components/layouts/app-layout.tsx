import { Outlet } from "react-router-dom";

import Footer from "@/components/layouts/footer";
import Navbar from "@/components/layouts/navbar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
