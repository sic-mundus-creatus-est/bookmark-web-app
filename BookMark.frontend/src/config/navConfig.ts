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
        title: "Sign In",
        to: "/signin",
        icon: "log-in",
      },
      {
        title: "Sign Up",
        to: "/signup",
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
};
