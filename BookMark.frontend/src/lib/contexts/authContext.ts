import { createContext } from "react";

import { UserAuth, UserCreate } from "@/lib/types/user";

export interface IAuthContext {
  user?: UserAuth;
  signIn: (credentials: {
    usernameOrEmail: string;
    password: string;
  }) => Promise<boolean>;
  signUp: (data: UserCreate) => Promise<boolean>;
  signOut: () => void;
  loading: boolean;
}

export const AuthContext = createContext<IAuthContext>(null!);
