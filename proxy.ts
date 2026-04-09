import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

// Session cache to avoid redundant validation during request lifecycle
const SESSION_CACHE = new Map<string, { valid: boolean; timestamp: number }>();
const CACHE_TTL = 5000; // 5 seconds

async function validateSession(request: NextRequest): Promise<boolean> {
  const sessionToken = request.cookies.get("better-auth.session_token")?.value;
  
  if (!sessionToken) {
    return false;
  }

  // Check cache
  const cached = SESSION_CACHE.get(sessionToken);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.valid;
  }

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    const isValid = !!session?.user?.id;
    
    // Cache result
    SESSION_CACHE.set(sessionToken, { valid: isValid, timestamp: Date.now() });
    
    // Cleanup old cache entries periodically
    if (SESSION_CACHE.size > 100) {
      const now = Date.now();
      for (const [key, value] of SESSION_CACHE.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          SESSION_CACHE.delete(key);
        }
      }
    }
    
    return isValid;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
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

  const isAuthenticated = await validateSession(request);

  // Protect dashboard routes - redirect to signin if not authenticated
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname === "/signin" || pathname === "/signup") {
    if (isAuthenticated) {
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

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
