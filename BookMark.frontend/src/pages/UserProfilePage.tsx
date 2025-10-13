import { CommonDescription } from "@/components/ui/common/common-description";
import { useLoading } from "@/lib/contexts/useLoading";
import { ApiError } from "@/lib/services/api-calls/api";
import { useUser } from "@/lib/services/api-calls/hooks/useUserApi";
import { SquareUserRound } from "lucide-react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function UserProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams() as { id: string };

  const { showLoadingScreen, hideLoadingScreen } = useLoading();

  const {
    data: user,
    isFetching: isUserFetching,
    error: userError,
  } = useUser(id);

  useEffect(() => {
    if (!id) {
      navigate("/");
    }
  }, [id, navigate]);

  useEffect(() => {
    if (isUserFetching) showLoadingScreen();
    else hideLoadingScreen();
  }, [isUserFetching, showLoadingScreen, hideLoadingScreen]);

  if (userError)
    return (
      <div className="text-center p-10 text-lg font-mono text-destructive">
        {userError instanceof ApiError
          ? userError.detail
          : "An unexpected error occurred. Reload to try again."}
      </div>
    );
  return (
    <div className="mt-4">
      <div className="w-full bg-accent flex flex-col items-center pt-7 pb-4 rounded-t-3xl rounded-b-sm px-4 sm:px-10 lg:px-40">
        <SquareUserRound size={100} strokeWidth={1} className="text-popover" />
        <h4 className="font-bold text-muted ">{user?.displayName}</h4>
        <h5 className="font-bold -mt-1 text-muted ">@{user?.username}</h5>
        <br className="mt-2" />
        <CommonDescription placeholder=". . ." value={user?.aboutMe} />
      </div>
    </div>
  );
}
