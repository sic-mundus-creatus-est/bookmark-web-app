import { ReactNode, useEffect, useState } from "react";
import { UserAuth, UserCreate } from "../types/user";
import { createUser, signInUser } from "../services/api-calls/authApi";
import { AuthContext, IAuthContext } from "./authContext";
import { decodeToken } from "../utils";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const decoded = storedToken ? decodeToken(storedToken) : null;
    setUser(decoded);
    setLoading(false);
  }, []);

  // ---------------------- Auth Actions ------------------------
  const signIn: IAuthContext["signIn"] = async (credentials: {
    usernameOrEmail: string;
    password: string;
  }) => {
    try {
      const response = await signInUser(credentials);
      if (response.token) {
        localStorage.setItem("token", response.token);

        const decoded = decodeToken(response.token);
        if (decoded) {
          setUser(decoded);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("SignIn failed:", err);
      return false;
    }
  };
  // ----------------------------
  const signUp: IAuthContext["signUp"] = async (data: UserCreate) => {
    try {
      await createUser(data);
      return true;
    } catch (err) {
      console.error("SignUp failed:", err);
      return false;
    }
  };
  // -----------------------------
  const signOut: IAuthContext["signOut"] = () => {
    localStorage.removeItem("token");
    setUser(null);
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
