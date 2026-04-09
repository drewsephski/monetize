import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper to check for any session cookie
function hasSessionCookie(request: NextRequest): boolean {
  // Better Auth uses these cookie patterns
  const possibleCookies = [
    "better-auth.session_token",
    "better-auth.session",
    "session",
    "next-auth.session-token",
    "authjs.session-token",
  ];

  for (const cookieName of possibleCookies) {
    if (request.cookies.get(cookieName)?.value) {
      return true;
    }
  }
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!hasSessionCookie(request)) {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname === "/signin" || pathname === "/signup") {
    if (hasSessionCookie(request)) {
      const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
      return NextResponse.redirect(new URL(callbackUrl || "/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude monitoring route, Next.js internals, and static files
    '/((?!monitoring|_next/static|_next/image|favicon.ico|api/.*).*)',
  ],
};
