import { Outlet } from "react-router-dom";

import { Footer } from "@/components/layouts/footer";
import { Navbar } from "@/components/layouts/navbar";

export function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="container mx-auto lg:px-40 flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
