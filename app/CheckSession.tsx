"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

export default function CheckSession({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (
      status === "authenticated" &&
      (session as any)?.error === "RefreshAccessTokenError"
    ) {
      // Token refresh failed → force logout
      signOut({ callbackUrl: "/login" });
    }
  }, [status, session]);

  // While checking session
  if (status === "loading") {
    return <div className="p-4 text-gray-500">Checking session...</div>;
  }

  return <>{children}</>;
}
