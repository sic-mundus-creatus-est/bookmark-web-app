interface INavItem {
  title: string;
  to?: string;
  href?: string;
  icon?: string;
  disabled?: boolean;
  label?: string;
  items?: INavItem[]; // for nesting
}

export const navConfig: { [key: string]: INavItem } = {
  Home: {
    title: "Home",
    to: "/",
  },
  Auth: {
    title: "Auth",
    items: [
      {
        title: "Login",
        to: "/login",
        icon: "log-in",
      },
      {
        title: "Register",
        to: "/register",
        icon: "user-plus",
      },
    ],
  },
  Categories: {
    title: "Categories",
    items: [
      {
        title: "Books",
        to: "/books",
      },
      {
        title: "Comics",
        to: "/comics",
      },
      {
        title: "Manga",
        to: "/manga",
      },
    ],
  },
  Content: {
    title: "Content",
    items: [
      {
        title: "Genres",
        to: "/genres",
      },
      {
        title: "Reviews",
        to: "/reviews",
      },
      {
        title: "Ratings",
        to: "/ratings",
      },
    ],
  },
};
