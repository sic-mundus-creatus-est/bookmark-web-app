import { createContext } from "react";

import { UserAuth, UserCreate } from "@/lib/types/user";

export interface IAuthContext {
  user?: UserAuth;
  signIn: (credentials: {
    usernameOrEmail: string;
    password: string;
  }) => Promise<void>;
  signUp: (data: UserCreate) => Promise<void>;
  signOut: () => void;
  loading: boolean;
}

export const AuthContext = createContext<IAuthContext>(null!);
