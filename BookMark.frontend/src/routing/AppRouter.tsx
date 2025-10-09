import { Navigate, createBrowserRouter } from "react-router-dom";

import { PrivateRoute } from "./PrivateRoute";
import { HomePage } from "../pages/HomePage";
import { SignInPage } from "@/pages/SignInPage";
import { AppLayout } from "@/AppLayout";
import { BooksPage } from "@/pages/BooksPage";
import { BookPage } from "@/pages/BookPage";
import { AddBookPage } from "@/pages/AddBookPage";
import { GenrePage } from "@/pages/GenrePage";
import { AuthorPage } from "@/pages/AuthorPage";
import { SignUpPage } from "@/pages/SignUpPage";

export const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/private",
        element: <PrivateRoute component={HomePage} />,
      },
      {
        path: "/home",
        element: <HomePage />,
      },
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
        path: "/",
        element: <BooksPage />,
      },
      {
        path: "/all",
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
    element: <Navigate to="/" />,
  },
]);
