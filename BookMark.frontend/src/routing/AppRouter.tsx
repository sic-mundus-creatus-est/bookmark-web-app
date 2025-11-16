import { Navigate, createBrowserRouter } from "react-router-dom";

// import { PrivateRoute } from "./PrivateRoute";
import { SignInPage } from "@/pages/SignInPage";
import { AppLayout } from "@/AppLayout";
import { BooksPage } from "@/pages/BooksPage";
import { BookPage } from "@/pages/BookPage";
import { AddBookPage } from "@/pages/AddBookPage";
import { GenrePage } from "@/pages/GenrePage";
import { AuthorPage } from "@/pages/AuthorPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { UserProfilePage } from "@/pages/UserProfilePage";

export const AppRouter = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // {
      //   path: "/private",
      //   element: <PrivateRoute component={Page} />,
      // },
      {
        path: "/add-book",
        element: <AddBookPage />,
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
        path: "/home",
        element: <BooksPage />,
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
        path: "/user/:id",
        element: <UserProfilePage />,
      },
    ],
  },
  {
    path: "/signin",
    element: <SignInPage />,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
  {
    path: "*",
    element: <Navigate to="/home" />,
  },
]);
