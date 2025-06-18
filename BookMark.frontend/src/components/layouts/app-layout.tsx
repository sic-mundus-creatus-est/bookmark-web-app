import { Outlet, useNavigate } from "react-router-dom";

import { UserRoundPen } from "lucide-react";
import { BookCopy } from "lucide-react";
import { Tags } from "lucide-react";

import { Footer } from "@/components/layouts/footer";
import { Navbar } from "@/components/layouts/navbar";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { FloatingActionMenu } from "@/components/ui/floating-action-menu";

export function AppLayout() {
  const navigate = useNavigate();

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
          onClick={() => navigate("/add-book")}
        />
        <FloatingActionButton
          label="Add Genre"
          icon={<Tags />}
          onClick={() => console.log("Clcked on Add Genre")}
        />
        <FloatingActionButton
          label="Add Author"
          icon={<UserRoundPen />}
          onClick={() => console.log("Clcked on Add Author")}
        />
      </FloatingActionMenu>
    </div>
  );
}
