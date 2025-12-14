import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Logo } from "@/components/logo";
import { CommonTextInput } from "@/components/ui/common/common-text-input";
import {
  CommonErrorLabel,
  CommonSubmitButton,
} from "@/components/ui/common/common-submit-button";
import { Footer } from "@/components/layouts/footer";
import { useAuth } from "@/lib/contexts/useAuth";
import { ApiError } from "@/lib/services/api-calls/api";

export function SignInPage() {
  //--------------------------------
  const auth = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  //--------------------------------

  //-----------------------------------------------
  const [credentials, setCredentials] = useState({
    usernameOrEmail: "",
    password: "",
  });
  //-----------------------------------------------
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!credentials.usernameOrEmail.trim() || !credentials.password.trim()) {
      setError("Please enter both your username/email and password.");
      return;
    }

    setLoading(true);
    setError(undefined);
    try {
      await auth.signIn(credentials);
      navigate("/home");
    } catch (err: any) {
      if (err instanceof ApiError) setError(err.detail);
      else setError("Unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <div className="bg-muted flex flex-col items-center flex-grow m-2 mb-10">
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
              <CommonTextInput
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
              <CommonTextInput
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
                {error && <CommonErrorLabel error={error} />}
                <CommonSubmitButton label="Sign In" loading={loading} />
                <h4 className="text-accent italic text-end leading-tight select-none">
                  By signing in, you agree to the BookMark Terms of Service and
                  Privacy Policy.
                </h4>
              </div>
              <h5 className="text-accent text-md text-end font-semibold font-[Helvetica] select-none">
                ➔ New to BookMark?{" "}
                <Link to="/sign-up">
                  <span
                    className="inline-block font-normal text-popover underline italic decoration-2 cursor-pointer
                   hover:scale-105"
                  >
                    Sign Up
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
