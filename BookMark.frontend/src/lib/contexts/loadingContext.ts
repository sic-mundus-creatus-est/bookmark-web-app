import { createContext } from "react";

export interface ILoadingContext {
  isLoading: boolean;
  showLoadingScreen: () => void;
  hideLoadingScreen: () => void;
}

export const LoadingContext = createContext<ILoadingContext>(null!);
