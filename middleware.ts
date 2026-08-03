// ============================================================
// Tashgheel — Next.js Middleware
// Route Protection + Row Level Security
// Standard Direct Auth Redirects (Eliminates API redirect loops)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// ─── Public Routes (no auth needed) ─────────────────────────

const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
];

// ─── Secret Keys ─────────────────────────────────────────────

const accessSecret = new TextEncoder().encode(
  process.env.JWT_ACCESS_SECRET ?? "tashgheel_default_access_secret_key_min_32_chars_2026_super_secure"
);

// ─── Helper: Get True Origin Behind Reverse Proxy (Railway) ──

function getOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return request.nextUrl.origin;
}

// ─── Middleware ───────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = getOrigin(request);

  // 1. Allow public routes
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublic) return NextResponse.next();

  // 2. Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 3. Get access token from cookie
  const accessToken = request.cookies.get("tashgheel_access")?.value;

  if (!accessToken) {
    // API route -> return 401 JSON
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "غير مصرح — يرجى تسجيل الدخول" },
        { status: 401 }
      );
    }

    // Web page -> Direct 307 redirect to /login
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Verify access token
  try {
    const { payload } = await jwtVerify(accessToken, accessSecret);

    // Add user info to request headers for server components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId as string);
    requestHeaders.set("x-company-id", payload.companyId as string);
    requestHeaders.set("x-branch-id", (payload.branchId as string) ?? "");
    requestHeaders.set("x-role-id", payload.roleId as string);
    requestHeaders.set("x-session-id", payload.sessionId as string);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch {
    // Invalid access token -> Return 401 for API, else clear cookies & redirect to /login
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "انتهت صلاحية الجلسة — يرجى تسجيل الدخول مجدداً" },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("tashgheel_access");
    response.cookies.delete("tashgheel_refresh");
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/).*)",
  ],
};
