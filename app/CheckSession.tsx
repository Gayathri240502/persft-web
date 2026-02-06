"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { decodeJwt } from "@/app/containers/utils/session/DecodeToken";

export default function CheckSession({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [unauthorized, setUnauthorized] = useState(false);



  useEffect(() => {
    if (
      status === "authenticated" &&
      (session as any)?.error === "RefreshAccessTokenError"
    ) {
      signOut({ callbackUrl: "/login" });
    }
  }, [status, session]);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const token = (session as any).accessToken;
      if (token) {
        const decoded: any = decodeJwt(token);
        const roles: string[] =
          decoded?.realm_access?.roles || decoded?.roles || [];

        const allowed =
          roles.includes("admin") ||
          roles.includes("merchant") ||
          roles.includes("project_manager") ||
          roles.includes("designer") ||
          roles.includes("finance") ||
          roles.includes("support") ||
          roles.includes("vendor") ||
          roles.some(r => String(r).toLowerCase().includes("project"));

        if (!allowed) {
          setUnauthorized(true);
        }
      } else {
        setUnauthorized(true);
      }
    }
  }, [status, session]);

  if (status === "loading") {
    return <div className="p-4 text-gray-500">Checking session...</div>;
  }

  if (unauthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="bg-white border border-gray-200 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            You don&apos;t have access to this application.
          </p>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
