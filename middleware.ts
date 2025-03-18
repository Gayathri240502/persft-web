export { default } from "next-auth/middleware";
export const config = {
  matcher: ["/((?!_next|api|login|static|favicon.ico|.*\\..*).*)"],
};
