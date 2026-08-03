// ============================================================
// Tashgheel — Token Refresh API Route
// GET /api/auth/refresh?redirect=/dashboard
// Fixed proxy-aware URL origin resolution for Railway/Docker
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  verifyRefreshToken,
  signAccessToken,
  setAuthCookies,
  clearAuthCookies,
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

export async function GET(request: NextRequest) {
  const origin = getOrigin(request);
  const { searchParams } = new URL(request.url);
  const redirect = searchParams.get("redirect") ?? "/";

  try {
    const refreshToken = request.cookies.get("tashgheel_refresh")?.value;

    if (!refreshToken) {
      const loginUrl = new URL("/login", origin);
      return NextResponse.redirect(loginUrl);
    }

    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      await clearAuthCookies();
      const loginUrl = new URL("/login", origin);
      return NextResponse.redirect(loginUrl);
    }

    // Check session exists in DB and not expired
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date() || session.user.status !== "ACTIVE") {
      await clearAuthCookies();
      const loginUrl = new URL("/login", origin);
      return NextResponse.redirect(loginUrl);
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
    await clearAuthCookies();
    const loginUrl = new URL("/login", origin);
    return NextResponse.redirect(loginUrl);
  }
}
