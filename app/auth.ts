import { jwtDecode } from "jwt-decode";

import { AuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { Session, User } from "next-auth";

// ✅ Extend next-auth types
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    roles?: string;
  }

  interface User {
    access_token?: string;
    roles?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    roles?: string;
  }
}

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
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(credentials),
          }
        );

<<<<<<< HEAD
        if (!res.ok) {
          console.error("Login failed:", await res.text());
          return null;
        }

        const user = await res.json();
        const decoded = jwtDecode(user.access_token) as any;

        return {
          id: decoded.sub,
          name:
            decoded.name || decoded.preferred_username || credentials?.username,
          email: decoded.email || "",
          roles: decoded.realm_access?.roles?.[0] || "",
          access_token: user.access_token,
        } satisfies User;
=======
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
>>>>>>> cff2d4a108657440ddc1f93a4d8bc55ea7ef4f55
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
<<<<<<< HEAD
        token.accessToken = user.access_token;
        token.roles = user.roles;
=======
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
>>>>>>> cff2d4a108657440ddc1f93a4d8bc55ea7ef4f55
      }

      return await refreshAccessToken(token);
    },
<<<<<<< HEAD
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.roles = token.roles;
=======

    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).refreshToken = token.refreshToken;
      (session as any).roles = token.roles;
      (session as any).error = token.error;
>>>>>>> cff2d4a108657440ddc1f93a4d8bc55ea7ef4f55
      return session;
    },
  },
  session: {
    strategy: "jwt",
<<<<<<< HEAD
  },
  secret: process.env.NEXTAUTH_SECRET,
=======
    maxAge: 60 * 60 * 24, // 1 day
  },
>>>>>>> cff2d4a108657440ddc1f93a4d8bc55ea7ef4f55
};

export const getSession = () => getServerSession(authOptions);
