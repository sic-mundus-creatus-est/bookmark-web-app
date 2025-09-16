import { ReactNode, useCallback, useState } from "react";
import { LoadingContext } from "./loadingContext";

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const showLoadingScreen = useCallback(() => setIsLoading(true), []);
  const hideLoadingScreen = useCallback(() => setIsLoading(false), []);

  return (
    <LoadingContext.Provider
      value={{
        isLoading: isLoading,
        showLoadingScreen: showLoadingScreen,
        hideLoadingScreen: hideLoadingScreen,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}
