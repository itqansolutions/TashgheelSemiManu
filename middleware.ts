// ============================================================
// Tashgheel — Next.js Middleware
// Route Protection + Row Level Security + Token Refresh
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
  process.env.JWT_ACCESS_SECRET ?? "fallback-secret-change-in-production"
);

// ─── Middleware ───────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublic) return NextResponse.next();

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get access token from cookie
  const accessToken = request.cookies.get("tashgheel_access")?.value;

  if (!accessToken) {
    // Try to redirect to refresh if refresh token exists
    const refreshToken = request.cookies.get("tashgheel_refresh")?.value;

    if (refreshToken && !pathname.startsWith("/api/")) {
      // Redirect to refresh endpoint then back
      const refreshUrl = new URL("/api/auth/refresh", request.url);
      refreshUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(refreshUrl);
    }

    // No tokens — redirect to login
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "غير مصرح — يرجى تسجيل الدخول" },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify access token
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
    // Token expired or invalid
    const refreshToken = request.cookies.get("tashgheel_refresh")?.value;

    if (refreshToken && !pathname.startsWith("/api/")) {
      const refreshUrl = new URL("/api/auth/refresh", request.url);
      refreshUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(refreshUrl);
    }

    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, message: "انتهت صلاحية الجلسة — يرجى تسجيل الدخول مجدداً" },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("tashgheel_access");
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/).*)",
  ],
};
