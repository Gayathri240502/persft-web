"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Custom hook to get token and role from session
 */
export const useTokenAndRole = () => {
  const { data: session, status } = useSession();

  return {
    token: (session as any)?.accessToken || "",
    role: (session as any)?.roles || "",
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
};

/**
 * Clear session using NextAuth signOut
 */
export const clearSession = () => {
  signOut({ callbackUrl: "/login" });
};

/**
 * Props for protecting components/pages
 */
interface Props {
  roles?: string[];
  children: React.ReactNode;
}

/**
 * Protects client-side routes based on session and optional roles
 */
export default function CheckSession({ roles = [], children }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (
      status === "authenticated" &&
      roles.length > 0 &&
      !roles.includes((session as any)?.roles)
    ) {
      router.replace("/unauthorized");
    }
  }, [status, session, roles, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <span className="ml-4 text-gray-600">Loading...</span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    // Optional fallback while redirecting
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Redirecting to login...</p>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Server-side function to get session data
 */
export const getServerSession = async () => {
  const { getSession } = await import("@/app/auth");
  return getSession();
};
