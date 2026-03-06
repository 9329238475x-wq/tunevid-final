import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const pathname = request.nextUrl.pathname;

  // Tool listing page (/tools) is public — individual tool pages require login
  if (pathname === "/tools") {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Protect dashboard, create, profile, AND individual tool pages (not /tools listing)
  matcher: [
    "/dashboard/:path*",
    "/dashboard",
    "/create",
    "/profile",
    "/tools/:path*",
  ],
};
