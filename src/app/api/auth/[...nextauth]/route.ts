import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import jwt from "jsonwebtoken";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "tunevid-super-secret-key-change-in-production";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly",
          access_type: "offline",
          prompt: "consent select_account",
        },
      },
    }),
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const db = getDb();
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";

        if (!email || !password) return null;

        const result = await db.query(
          `
            SELECT id::text, email, name, password_hash
            FROM users
            WHERE email = $1
            LIMIT 1
          `,
          [email]
        );

        const user = result.rows[0];
        if (!user?.password_hash) return null;

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email.split("@")[0],
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account?.provider === "google") {
        // Store Google tokens for YouTube API
        token.googleAccessToken = account.access_token;
        token.googleRefreshToken = account.refresh_token ?? token.googleRefreshToken;
        token.expiresAt = account.expires_at;
        token.picture = (profile as any)?.picture ?? (profile as any)?.image;
      }
      if (account?.provider === "credentials" && user) {
        token.userId = (user as any).id;
      }

      // Create a backend-compatible JWT signed with NEXTAUTH_SECRET
      // This token has the user info the backend needs
      if (token.email) {
        token.backendToken = jwt.sign(
          {
            email: token.email,
            name: token.name,
            picture: token.picture,
            sub: token.sub,
          },
          NEXTAUTH_SECRET,
          { algorithm: "HS256", expiresIn: "30d" }
        );
      }

      return token;
    },
    async session({ session, token }) {
      // backendToken = JWT signed with NEXTAUTH_SECRET for backend auth
      session.accessToken = token.backendToken as string | undefined;
      // googleAccessToken = actual Google OAuth token for YouTube API
      session.googleAccessToken = token.googleAccessToken as string | undefined;
      session.refreshToken = token.googleRefreshToken as string | undefined;
      if (session.user) {
        (session.user as any).id = (token.userId as string | undefined) || (token.sub as string | undefined);
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // After sign-in, always go to the callback URL or /tools
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return `${baseUrl}/tools`;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
