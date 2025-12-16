import { Navigate, createBrowserRouter } from "react-router-dom";

import { SignInPage } from "@/pages/SignInPage";
import { AppLayout } from "@/AppLayout";
import { BooksPage } from "@/pages/BooksPage";
import { BookPage } from "@/pages/BookPage";
import { AddBookPage } from "@/pages/AddBookPage";
import { GenrePage } from "@/pages/GenrePage";
import { AuthorPage } from "@/pages/AuthorPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { UserProfilePage } from "@/pages/UserProfilePage";
import { user_roles } from "@/config/roles";
import { AuthorizedOnly } from "./components/AuthorizedOnly";

export const AppRouter = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/home",
        element: <BooksPage />,
      },
      {
        path: "/add-book",
        element: (
          <AuthorizedOnly role={user_roles.admin} redirect>
            <AddBookPage />
          </AuthorizedOnly>
        ),
      },
      {
        path: "/book/:id",
        element: <BookPage />,
      },
      {
        path: "/genre/:id",
        element: <GenrePage />,
      },
      {
        path: "/author/:id",
        element: <AuthorPage />,
      },
      {
        path: "/books",
        element: <BooksPage />,
        handle: ["book"],
      },
      {
        path: "/comics",
        element: <BooksPage />,
        handle: ["comic"],
      },
      {
        path: "/manga",
        element: <BooksPage />,
        handle: ["manga"],
      },
      {
        path: "/all",
        element: <BooksPage />,
      },
      {
        path: "/user/:id",
        element: <UserProfilePage />,
      },
    ],
  },
  {
    path: "/sign-in",
    element: <SignInPage />,
  },
  {
    path: "/sign-up",
    element: <SignUpPage />,
  },
  {
    path: "*",
    element: <Navigate to="/home" />,
  },
]);
