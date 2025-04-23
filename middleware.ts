import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isTokenExpired } from "./app/containers/utils/session/DecodeToken";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";

  // If trying to access login page and already logged in, redirect to dashboard
  if (isLoginPage && token && !isTokenExpired(token)) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // If not logged in or token expired, redirect to login page
  if (!token || isTokenExpired(token)) {
    if (!isLoginPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico|.*\\..*).*)"],
};
