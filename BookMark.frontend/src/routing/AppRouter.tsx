import { Navigate, createBrowserRouter } from "react-router-dom";
import { PrivateRoute } from "./PrivateRoute";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { AppLayout } from "@/components/layouts/app-layout";
import { TestPage } from "@/pages/TestPage";
import { BookPage } from "@/pages/BookPage";

export const AppRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <PrivateRoute component={HomePage} />,
      },
      {
        path: "/home",
        element: <HomePage />,
      },
      {
        path: "/info",
        element: <div></div>,
      },
      {
        path: "/test",
        element: <TestPage />,
      },
      {
        path: "/book/:id",
        element: <BookPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "*",
    element: <Navigate to="/test" />,
  },
]);
