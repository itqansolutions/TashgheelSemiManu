// ============================================================
// Tashgheel — Token Refresh API Route
// GET /api/auth/refresh?redirect=/dashboard
// Fixed ERR_TOO_MANY_REDIRECTS by explicitly deleting cookies on response
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  verifyRefreshToken,
  signAccessToken,
  setAuthCookies,
  TokenPayload,
} from "@/lib/auth";

function getOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return request.nextUrl.origin;
}

function clearCookiesAndRedirectToLogin(origin: string): NextResponse {
  const loginUrl = new URL("/login", origin);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete("tashgheel_access");
  response.cookies.delete("tashgheel_refresh");
  return response;
}

export async function GET(request: NextRequest) {
  const origin = getOrigin(request);
  const { searchParams } = new URL(request.url);
  const redirect = searchParams.get("redirect") ?? "/";

  try {
    const refreshToken = request.cookies.get("tashgheel_refresh")?.value;

    if (!refreshToken) {
      return clearCookiesAndRedirectToLogin(origin);
    }

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return clearCookiesAndRedirectToLogin(origin);
    }

    // Check session exists in DB and not expired
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date() || session.user.status !== "ACTIVE") {
      return clearCookiesAndRedirectToLogin(origin);
    }

    // Update last active
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActive: new Date() },
    });

    // Issue new access token
    const newPayload: TokenPayload = {
      userId:    session.user.id,
      companyId: session.user.companyId,
      branchId:  session.user.branchId ?? undefined,
      roleId:    session.user.roleId,
      email:     session.user.email,
      name:      session.user.name,
      sessionId: session.id,
    };

    const newAccessToken = await signAccessToken(newPayload);
    await setAuthCookies(newAccessToken, refreshToken);

    const redirectUrl = new URL(redirect, origin);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("[Refresh API]", error);
    return clearCookiesAndRedirectToLogin(origin);
  }
}
