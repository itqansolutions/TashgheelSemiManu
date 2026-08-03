// ============================================================
// Tashgheel — Logout API Route
// POST /api/auth/logout
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  getAccessTokenFromCookie,
  getRefreshTokenFromCookie,
  verifyAccessToken,
  clearAuthCookies,
} from "@/lib/auth";
import { audit } from "@/lib/activity-log";

export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessTokenFromCookie();
    const refreshToken = await getRefreshTokenFromCookie();
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";

    if (accessToken) {
      const session = await verifyAccessToken(accessToken);

      if (session) {
        // Log logout
        await audit.logout(session, ip);

        // Delete session from DB
        if (refreshToken) {
          await prisma.session.deleteMany({
            where: { refreshToken },
          });
        }
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "تم تسجيل الخروج بنجاح",
    });

    response.cookies.delete("tashgheel_access");
    response.cookies.delete("tashgheel_refresh");

    return response;
  } catch (error) {
    console.error("[Logout API]", error);
    const response = NextResponse.json({
      success: true,
      message: "تم تسجيل الخروج",
    });

    response.cookies.delete("tashgheel_access");
    response.cookies.delete("tashgheel_refresh");

    return response;
  }
}
