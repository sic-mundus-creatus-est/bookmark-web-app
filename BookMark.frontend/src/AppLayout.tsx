import { Outlet } from "react-router-dom";

import { BookCopy } from "lucide-react";

import { Footer } from "@/components/layouts/footer";
import { Navbar } from "@/components/layouts/navbar";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { FloatingActionMenu } from "@/components/ui/floating-action-menu";
import { AddGenreModal } from "@/components/layouts/add-genre-modal";
import { AddAuthorModal } from "@/components/layouts/add-author-modal";

export function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="container mx-auto lg:px-40 flex-grow">
        <Outlet />
      </main>
      <Footer />

      <FloatingActionMenu>
        <FloatingActionButton
          label="Add Book"
          icon={<BookCopy />}
          to="/add-book"
        />
        <AddGenreModal />
        <AddAuthorModal />
      </FloatingActionMenu>
    </div>
  );
}
