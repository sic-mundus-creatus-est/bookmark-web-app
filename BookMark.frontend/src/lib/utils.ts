import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UserAuth } from "./types/user";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

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

export const decodeToken = (token: string): UserAuth | undefined => {
  try {
    const decoded = jwtDecode<UserAuth>(token);
    if (decoded.exp * 1000 < Date.now()) return; // token expired if null
    return { sub: decoded.sub, role: decoded.role, exp: decoded.exp };
  } catch {
    return;
  }
};

// ================================================

export interface ConstrainedQueryParams {
  pageIndex: number;
  pageSize: number;
  sortBy?: string;
  sortDescending?: boolean;
  filters?: Record<string, string | number>;
}
export function buildConstrainedQueryParams({
  pageIndex = 1,
  pageSize = 10,
  sortBy = "",
  sortDescending = false,
  filters = {},
}: ConstrainedQueryParams): string {
  const queryParams = new URLSearchParams();

  queryParams.append("pageIndex", pageIndex.toString());
  queryParams.append("pageSize", pageSize.toString());
  queryParams.append("sortBy", sortBy);
  queryParams.append("sortDescending", sortDescending.toString());

  for (const [key, value] of Object.entries(filters)) {
    queryParams.append(`filters[${key}]`, value.toString());
  }

  return queryParams.toString();
}

// ================================================

export function useDebouncedValue(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    if (value === "") {
      setDebouncedValue("");
      return;
    }

    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
