import { ReactNode, useEffect, useState } from "react";
import { UserAuth, UserCreate } from "../types/user";
import { createUser, signInUser } from "../services/api-calls/authApi";
import { AuthContext, IAuthContext } from "./authContext";
import { decodeToken } from "../utils";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserAuth>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const decoded = storedToken ? decodeToken(storedToken) : undefined;
    setUser(decoded);
    setLoading(false);
  }, []);

  // ---------------------- Auth Actions ------------------------
  const signIn: IAuthContext["signIn"] = async (credentials: {
    usernameOrEmail: string;
    password: string;
  }) => {
    const response = await signInUser(credentials);
    localStorage.setItem("token", response.token);

    const decoded = decodeToken(response.token);
    setUser(decoded);
  };
  // ----------------------------
  const signUp: IAuthContext["signUp"] = async (data: UserCreate) => {
    await createUser(data);
  };
  // -----------------------------
  const signOut: IAuthContext["signOut"] = () => {
    localStorage.removeItem("token");
    setUser(undefined);
  };
  // ------------------------------------------------------------

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn: signIn,
        signUp: signUp,
        signOut: signOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
