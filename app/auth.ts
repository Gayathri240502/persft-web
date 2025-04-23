import { jwtDecode } from 'jwt-decode';
import { AuthOptions, getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const authOptions: AuthOptions = {
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      type: 'credentials',
      credentials: {
        username: {
          label: 'username',
          type: 'tex',
          placeholder: 'enter username',
        },
        password: {
          label: 'password',
          type: 'password',
          placeholder: 'enter password',
        },
      },
      async authorize(credentials) {
        const credentialDetails = {
          username: credentials?.username,
          password: credentials?.password,
        };
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(credentialDetails),
            }
          );
          if (response.ok) {
            const user = await response.json();
            const decoded = jwtDecode(user.access_token) as any;
            user.roles = decoded.realm_access?.roles[0] || '';
            return user;
          } else {
            throw new Error(
              'Authentication failed with status code:' + response.status
            );
          }
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      const userDetails = user as any;
      if (userDetails) {
        token.accessToken = userDetails.access_token;
        token.roles = userDetails.roles || '';
        token.expiresIn = Date.now() + userDetails.expires_in * 1000;
        token.refreshToken = userDetails.refresh_token;
        token.refreshExpiresIn =
          Date.now() + userDetails.refresh_expires_in * 1000;
        return token;
      } else {
        const tokenExpiry = token.expiresIn as number;
        if (Date.now() < tokenExpiry) {
          return token;
        } else {
          token.error = 'RefreshTokenError';
          return token;
        }
      }
    },
    session: ({ session, token }) => {
      const sessions = session as any;
      sessions.expiresIn = token.expiresIn;
      sessions.roles = token.roles;
      sessions.accessToken = token.accessToken;
      sessions.error = token.error;
      return sessions;
    },
  },
};

const getSession = () => getServerSession(authOptions);

export { authOptions, getSession };
