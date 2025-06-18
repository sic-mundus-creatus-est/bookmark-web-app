import { Navigate, createBrowserRouter } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { AppLayout } from "@/components/layouts/app-layout";
import { TestPage } from "@/pages/TestPage";
import { BookPage } from "@/pages/BookPage";
import { AddBookPage } from "@/pages/AddBookPage";

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
        path: "/book/:id",
        element: <BookPage />,
      },
      {
        path: "/add-book",
        element: <AddBookPage />,
      },
      {
        path: "/",
        element: <TestPage />,
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
