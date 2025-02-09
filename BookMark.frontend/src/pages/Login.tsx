import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "@/lib/contexts/authContext";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [credentials, setCredentials] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isLoggedIn = await auth?.login(credentials);

    if (isLoggedIn) {
      navigate("/");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-4 p-4 max-w-md mx-auto"
    >
      <input
        type="text"
        placeholder="Username or Email"
        value={credentials.usernameOrEmail}
        onChange={(e) =>
          setCredentials({ ...credentials, usernameOrEmail: e.target.value })
        }
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <input
        type="password"
        placeholder="Password"
        value={credentials.password}
        onChange={(e) =>
          setCredentials({ ...credentials, password: e.target.value })
        }
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <Button
        type="submit"
        className="py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
      >
        Login
      </Button>
    </form>
  );
}
