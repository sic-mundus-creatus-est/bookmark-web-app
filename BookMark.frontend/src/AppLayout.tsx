import { Outlet } from "react-router-dom";

import { BookCopy } from "lucide-react";

import { Footer } from "@/components/layouts/footer";
import { Navbar } from "@/components/layouts/navbar";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { FloatingActionMenu } from "@/components/ui/floating-action-menu";
import { AddGenreModal } from "@/components/layouts/add-genre-modal";
import { AddAuthorModal } from "@/components/layouts/add-author-modal";
import { useAuth } from "./lib/contexts/useAuth";
import { user_roles } from "./config/roles";

export function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow max-w-full container mx-auto px-6 md:px-20 lg:px-44 2xl:px-80">
        <Navbar />
        <Outlet />
      </main>
      <Footer />

      {user?.role?.includes(user_roles.admin) && (
        <FloatingActionMenu>
          <FloatingActionButton
            label="Add Book"
            icon={<BookCopy />}
            to="/add-book"
          />
          <AddGenreModal />
          <AddAuthorModal />
        </FloatingActionMenu>
      )}
    </div>
  );
}
