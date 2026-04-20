import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require login
const protectedRoutes = [
  "/profile",
  "/review/write",
  "/claim",
  "/list-your-model",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value;

  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/review/write/:path*",
    "/claim/:path*",
    "/list-your-model/:path*",
  ],
};
