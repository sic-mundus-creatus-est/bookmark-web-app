import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Logo } from "@/components/logo";
import { CommonTextInput } from "@/components/ui/common/common-text-input-field";
import { CommonSubmitButton } from "@/components/ui/common/common-submit-button";
import { Footer } from "@/components/layouts/footer";
import { UserCreate } from "@/lib/types/user";
import { useAuth } from "@/lib/contexts/useAuth";

export function SignUpPage() {
  //--------------------------------
  const auth = useAuth();
  const navigate = useNavigate();
  //--------------------------------

  //-------------------------------------------------------------
  const [newUserData, setNewUserData] = useState<UserCreate>({
    displayName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  //-------------------------------------------------------------

  useEffect(() => {
    if (auth.user) {
      navigate("/home");
    }
  }, [auth, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(newUserData);

    const successfulSignUp = await auth.signUp(newUserData);

    if (successfulSignUp) navigate("/signin");
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <div className="bg-muted flex flex-col items-center flex-grow m-2 mb-10">
        <div className="mb-6 mt-10 scale-125 -ml-3">
          <Logo />
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col w-full max-w-sm bg-muted rounded-2xl border-4 border-b-8 border-accent"
        >
          <h2 className="p-2 text-muted text-center font-[Verdana] text-3xl font-bold bg-accent border-b-8 border-popover rounded-sm select-none">
            Sign Up
          </h2>
          <div className="p-4 space-y-4">
            <CommonTextInput
              label="Your Name"
              fontSize={16}
              placeholder="John Doe"
              value={newUserData.displayName}
              maxLength={64}
              showCharCount
              onChange={(name) =>
                setNewUserData({ ...newUserData, displayName: name })
              }
              singleLine
            />
            <CommonTextInput
              label="Username"
              fontSize={16}
              placeholder="john.doe"
              value={newUserData.username}
              maxLength={32}
              showCharCount
              onChange={(username) =>
                setNewUserData({ ...newUserData, username: username })
              }
              singleLine
              noBreaks
            />
            <CommonTextInput
              label="E-mail"
              fontSize={16}
              placeholder="john.doe@example.com"
              value={newUserData.email}
              maxLength={256}
              showCharCount
              onChange={(email) =>
                setNewUserData({ ...newUserData, email: email })
              }
              singleLine
              noBreaks
            />
            <CommonTextInput
              label="Password"
              fontSize={16}
              placeholder="at least 6 characters"
              value={newUserData.password}
              onChange={(pass) =>
                setNewUserData({ ...newUserData, password: pass })
              }
              singleLine
              isSecret
              noBreaks
            />
            <CommonTextInput
              label="Re-enter password"
              fontSize={16}
              placeholder="must match above"
              value={newUserData.confirmPassword}
              onChange={(pass) =>
                setNewUserData({ ...newUserData, confirmPassword: pass })
              }
              singleLine
              isSecret
              noBreaks
            />
            <div className="flex flex-col">
              <CommonSubmitButton label="Create Account" />
              <h4 className="text-accent italic text-end select-none">
                By creating an account, you agree to the BookMark Terms of
                Service and Privacy Policy.
              </h4>
            </div>
            <h5 className="text-accent text-md text-end font-semibold font-[Helvetica] select-none">
              ➔ Already have an account?{" "}
              <Link to="/signin">
                <span
                  className="inline-block font-normal text-popover underline italic decoration-2 cursor-pointer
                   hover:scale-105"
                >
                  Sign in
                </span>
              </Link>
            </h5>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
