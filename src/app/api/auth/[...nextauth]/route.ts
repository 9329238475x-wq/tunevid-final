import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";

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
          prompt: "select_account",
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
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
        token.picture = (profile as any)?.picture ?? (profile as any)?.image;
      }
      if (account?.provider === "credentials" && user) {
        token.userId = (user as any).id;
      }

      // Sync user with backend on first login
      if (account?.provider === "google" && token.email) {
        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
          await fetch(`${API_BASE}/api/user/me`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${account.access_token}`,
              "Content-Type": "application/json",
            },
          }).catch(() => { });
        } catch {
          // Backend sync is best-effort
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.refreshToken = token.refreshToken as string | undefined;
      if (session.user) {
        (session.user as any).id = (token.userId as string | undefined) || (token.sub as string | undefined);
      }
      (session as any).planType = (token as any).planType || "free";
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
