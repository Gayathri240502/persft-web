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

const authOptions: AuthOptions = {
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
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.access_token;
        token.roles = user.roles;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.roles = token.roles;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const getSession = () => getServerSession(authOptions);

export { authOptions, getSession };
