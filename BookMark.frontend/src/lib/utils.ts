import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UserAuth } from "./types/user";
import { jwtDecode } from "jwt-decode";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ================================================

export function getDirtyValues<T extends object>(
  allFields: T,
  dirtyFields: any
): Partial<T> {
  return Object.keys(dirtyFields).reduce((acc, key) => {
    const isDirty = dirtyFields[key as keyof T];

    if (isDirty === true) {
      // Field is dirty -> take its current value
      (acc as any)[key] = (allFields as any)[key];
    } else if (isDirty && typeof isDirty === "object") {
      // Nested object -> recurse
      const nested = getDirtyValues((allFields as any)[key], isDirty as any);
      if (Object.keys(nested).length > 0) {
        (acc as any)[key] = nested;
      }
    }
    return acc;
  }, {} as Partial<T>);
}

// ================================================

export const decodeToken = (token: string): UserAuth | null => {
  try {
    const decoded = jwtDecode<UserAuth>(token);
    if (decoded.exp * 1000 < Date.now()) return null; // token expired if null
    return { username: decoded.username, role: decoded.role, exp: decoded.exp };
  } catch {
    return null;
  }
};
