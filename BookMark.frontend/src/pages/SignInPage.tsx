import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Logo } from "@/components/logo";
import { CommonTextInputField } from "@/components/ui/common/common-text-input-field";
import { CommonSubmitButton } from "@/components/ui/common/common-submit-button";
import { Footer } from "@/components/layouts/footer";
import { useAuth } from "@/lib/contexts/useAuth";

export function SignInPage() {
  //--------------------------------
  const auth = useAuth();
  const navigate = useNavigate();
  //--------------------------------

  //-----------------------------------------------
  const [credentials, setCredentials] = useState({
    usernameOrEmail: "",
    password: "",
  });
  //-----------------------------------------------

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const successfulSignIn = await auth.signIn(credentials);

    if (successfulSignIn) navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <div className="bg-muted flex flex-col items-center flex-grow m-2">
        <div className="mb-6 mt-10 scale-125 -ml-3">
          <Logo />
        </div>
        <div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full max-w-sm bg-muted rounded-2xl border-4 border-b-8 border-accent"
          >
            <h2 className="p-2 text-muted text-center font-[Verdana] text-3xl font-bold bg-accent border-b-8 border-popover rounded-sm select-none">
              Sign In
            </h2>
            <div className="p-4 space-y-4">
              <CommonTextInputField
                label="Username/E-mail"
                fontSize={16}
                placeholder="you@example.com"
                value={credentials.usernameOrEmail}
                maxLength={256}
                onChange={(user) =>
                  setCredentials({ ...credentials, usernameOrEmail: user })
                }
                singleLine
                noBreaks
              />
              <CommonTextInputField
                label="Password"
                fontSize={16}
                placeholder="•••••••••••••••"
                value={credentials.password}
                onChange={(pass) =>
                  setCredentials({ ...credentials, password: pass })
                }
                singleLine
                isSecret
                noBreaks
              />
              <div>
                <CommonSubmitButton label="Sign In" />
                <h4 className="text-accent italic text-end leading-tight select-none">
                  By signing in, you agree to the BookMark Terms of Service and
                  Privacy Policy.
                </h4>
              </div>
              <h5 className="text-accent text-md text-end font-semibold font-[Helvetica] select-none">
                ➔ New to BookMark?{" "}
                <Link to="/signup">
                  <span
                    className="inline-block font-normal text-popover underline italic decoration-2 cursor-pointer
                   hover:scale-105"
                  >
                    Register
                  </span>
                </Link>
              </h5>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
