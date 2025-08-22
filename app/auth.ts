import { jwtDecode } from "jwt-decode";

import { AuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Helper: refresh expired access token
async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: token.refreshToken }),
      }
    );

    if (!response.ok) throw new Error("Failed to refresh access token");

    const refreshed = await response.json();
    const decoded: any = jwtDecode(refreshed.access_token);

    return {
      ...token,
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      accessTokenExpires: decoded?.exp
        ? decoded.exp * 1000
        : Date.now() + 10 * 60 * 1000, // fallback 10 min
      roles: decoded.realm_access?.roles || [],
      error: null,
    };
  } catch (err) {
    console.error("Error refreshing access token:", err);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: AuthOptions = {
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      type: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
          }
        );

        if (!response.ok) return null;
        const user = await response.json();
        const decoded: any = jwtDecode(user.access_token);

        return {
          ...user,
          roles: decoded.realm_access?.roles || [],
          accessTokenExpires: decoded?.exp
            ? decoded.exp * 1000
            : Date.now() + 10 * 60 * 1000,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          accessToken: (user as any).access_token,
          refreshToken: (user as any).refresh_token,
          accessTokenExpires: (user as any).accessTokenExpires,
          roles: (user as any).roles,
          error: null,
        };
      }

      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).refreshToken = token.refreshToken;
      (session as any).roles = token.roles;
      (session as any).error = token.error;
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 1 day
  },
};

export const getSession = () => getServerSession(authOptions);
