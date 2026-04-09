import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Optimistic session check using cookie presence only.
 * This is the recommended Better Auth pattern for Vercel middleware.
 * Note: This only checks if a session cookie exists, not if it's valid.
 * Full session validation should happen on the server for protected actions.
 */
function hasSessionCookie(request: NextRequest): boolean {
  // Check for both development and production cookie names
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");
  return !!sessionCookie?.value;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/monitoring")
  ) {
    return NextResponse.next();
  }

  // Use optimistic cookie check (not full session validation)
  // This avoids database queries in middleware which can cause issues on Vercel
  const hasSession = hasSessionCookie(request);

  // Protect dashboard routes - redirect to signin if no session cookie
  if (pathname.startsWith("/dashboard")) {
    if (!hasSession) {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname === "/signin" || pathname === "/signup") {
    if (hasSession) {
      const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
      // Prevent redirect loops by ensuring callbackUrl isn't the same auth page
      if (callbackUrl && callbackUrl !== "/signin" && callbackUrl !== "/signup") {
        return NextResponse.redirect(new URL(callbackUrl, request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// Configure matcher for Next.js middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
