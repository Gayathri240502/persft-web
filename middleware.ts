import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isTokenExpired } from "./app/containers/utils/session/DecodeToken";

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname === "/login" || pathname === "/forgot-credentials";

  if (isAuthPage && token && !isTokenExpired(token)) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico|.*\\..*).*)"],
};
