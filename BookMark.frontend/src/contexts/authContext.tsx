import { createContext, useState, useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

import { loginUser, registerUser } from "@/services/api-calls/authService";

interface User {
  username: string;
  role: string[];
}

interface IAuthContext {
  user: User | null;
  login: (credentials: {
    usernameOrEmail: string;
    password: string;
  }) => Promise<boolean>;
  register: (data: Record<string, any>) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<IAuthContext | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isTokenValid = (token: string): boolean => {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (isTokenValid(storedToken!)) {
      try {
        const decodedToken: User = jwtDecode(storedToken!);
        setUser(decodedToken);
      } catch (error) {
        logout();
        console.error("Invalid token: ", error);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  // ------------------------------------------------------------
  const login = async (credentials: {
    usernameOrEmail: string;
    password: string;
  }) => {
    const response = await loginUser(credentials);
    console.log("Login response:", response);
    if (response.token) {
      localStorage.setItem("token", response.token);
      setUser(jwtDecode(response.token));

      const decoded = jwtDecode(response.token);
      console.log("Logged in user:", decoded);

      return true;
    } else {
      return false;
    }
  };
  // ----------------------------
  const register = async (data: Record<string, any>) => {
    try {
      await registerUser(data);
      return true;
    } catch (error) {
      console.log("Registration failed: " + error);
      return false;
    }
  };
  // -----------------------------
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };
  // ------------------------------------------------------------

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
