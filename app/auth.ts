import { jwtDecode } from "jwt-decode";
import { AuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions: AuthOptions = {
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
        const decoded = jwtDecode(user.access_token) as any;
        user.roles = decoded.realm_access?.roles[0] || "";
        return user;
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.accessToken = (user as any).access_token;
        token.roles = (user as any).roles || "";
        return token;
      }
      return token;
    },
    session: ({ session, token }) => {
      (session as any).accessToken = token.accessToken;
      (session as any).roles = token.roles;
      return session;
    },
  },
};

const getSession = () => getServerSession(authOptions);

export { authOptions, getSession };
