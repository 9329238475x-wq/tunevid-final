import "next-auth";

declare module "next-auth" {
    interface User {
        id?: string;
    }

    interface Session {
        accessToken?: string;        // Backend JWT (signed with NEXTAUTH_SECRET)
        googleAccessToken?: string;  // Google OAuth token (for YouTube API)
        refreshToken?: string;       // Google refresh token
        user?: {
            id?: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        backendToken?: string;        // JWT for backend auth
        googleAccessToken?: string;   // Google OAuth access token
        googleRefreshToken?: string;  // Google refresh token  
        expiresAt?: number;
        userId?: string;
    }
}
