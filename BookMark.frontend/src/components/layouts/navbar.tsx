import { LogIn, LogOut, SquareUserRound, UserPlus } from "lucide-react";

import { DesktopNavbar } from "@/components/layouts/navbar-desktop";
import { MobileNavbar } from "@/components/layouts/navbar-mobile";
import { navConfig } from "@/config/navConfig";
import { useAuth } from "@/lib/contexts/useAuth";
import { Link, useNavigate } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="sticky md:top-0 w-full bg-background z-40">
      <AuthRow />
      <div className="flex items-center justify-between">
        <DesktopNavbar /> <MobileNavbar />
      </div>
    </nav>
  );
}

export function AuthRow() {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    auth.signOut();
    navigate("/signin");
  };

  return (
    <div className="pt-2 flex justify-end space-x-4 flex-wrap text-popover mr-1.5 lg:mr-0.5">
      {auth.user ? (
        <>
          <Link
            to={`/user/${auth.user?.sub}`}
            className="flex flex-row items-center text-sm font-semibold border-b-2 border-transparent hover:text-accent transition-colors duration-200"
          >
            <span className="mr-1">
              <SquareUserRound size={17} strokeWidth={2} />
            </span>
            Profile
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex flex-row items-center text-sm font-semibold border-b-2 border-transparent hover:text-accent transition-colors duration-200"
          >
            <span className="mr-1">
              <LogOut size={17} strokeWidth={2} />
            </span>
            Sign Out
          </button>
        </>
      ) : (
        navConfig.Auth.items?.map((item) => {
          const Icon = item.icon === "log-in" ? LogIn : UserPlus;
          return (
            <Link
              to={item.to!}
              className="flex flex-row items-center text-sm font-semibold border-b-2 border-transparent hover:text-accent transition-colors duration-200"
              key={item.title}
            >
              <span className="mr-1">
                <Icon size={17} strokeWidth={2} />
              </span>
              {item.title}
            </Link>
          );
        })
      )}
    </div>
  );
}
