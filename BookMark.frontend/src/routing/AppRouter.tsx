import { Navigate, createBrowserRouter } from "react-router-dom";

import { PrivateRoute } from "./PrivateRoute";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { AppLayout } from "@/components/layouts/app-layout";
import { BooksPage } from "@/pages/BooksPage";
import { BookPage } from "@/pages/BookPage";
import { AddBookPage } from "@/pages/AddBookPage";
import { GenrePage } from "@/pages/GenrePage";
import { AuthorPage } from "@/pages/AuthorPage";

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
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);
