"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export const getTokenAndRole = (): { token: string; role: string } => {
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token") || "";
    const role =
      localStorage.getItem("role") || sessionStorage.getItem("role") || "";
    return { token, role };
  }
  return { token: "", role: "" };
};

export const checkSession = (roles?: string[]): boolean => {
  const { token, role } = getTokenAndRole();

  if (!token) {
    window.location.href = "/login";
    return false;
  }

  if (roles && !roles.includes(role)) {
    window.location.href = "/login";
    return false;
  }

  return true;
};

export const setSession = (token: string, role: string) => {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("role", role);
};

export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("role");
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
};

export default function CheckSession(roles: string[]) {
  if (!checkSession(roles)) {
    redirect("/");
  }
}
