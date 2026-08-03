// ============================================================
// Tashgheel — Login API Route
// POST /api/auth/login
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import {
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
  parseDeviceInfo,
  TokenPayload,
} from "@/lib/auth";
import { audit } from "@/lib/activity-log";
import { addDays } from "date-fns";

// ─── Schema ───────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  remember: z.boolean().optional().default(false),
});

// ─── POST /api/auth/login ─────────────────────────────────────

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "";

  try {
    // Parse body
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    const { email, password, remember } = parsed.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        company: true,
      },
    });

    // User not found
    if (!user) {
      await audit.failedLogin(email, ip, userAgent);
      return NextResponse.json(
        { success: false, message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    // Check if active
    if (user.status !== "ACTIVE" || user.deletedAt) {
      return NextResponse.json(
        { success: false, message: "الحساب معطل. يرجى التواصل مع المسؤول" },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      await audit.failedLogin(email, ip, userAgent);
      return NextResponse.json(
        { success: false, message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    // Parse device info
    const deviceInfo = parseDeviceInfo(userAgent);

    // Create session
    const expiresAt = remember ? addDays(new Date(), 30) : addDays(new Date(), 7);

    // Build token payload
    const tokenPayload: Omit<TokenPayload, "sessionId"> = {
      userId:    user.id,
      companyId: user.companyId,
      branchId:  user.branchId ?? undefined,
      roleId:    user.roleId,
      email:     user.email,
      name:      user.name,
    };

    // Generate tokens first to get refreshToken
    const tempPayload = { ...tokenPayload, sessionId: "temp" };
    const refreshToken = await signRefreshToken(tempPayload);

    // Create session record
    const session = await prisma.session.create({
      data: {
        userId:      user.id,
        refreshToken,
        deviceName:  deviceInfo.deviceName,
        deviceType:  deviceInfo.deviceType,
        browser:     deviceInfo.browser,
        os:          deviceInfo.os,
        ipAddress:   ip,
        expiresAt,
      },
    });

    // Final payload with sessionId
    const finalPayload: TokenPayload = {
      ...tokenPayload,
      sessionId: session.id,
    };

    const accessToken = await signAccessToken(finalPayload);

    // Set cookies
    // Audit login
    await audit.login(finalPayload, ip, userAgent);

    // Update last active
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActive: new Date() },
    });

    const isProduction =
      process.env.NODE_ENV === "production" ||
      request.headers.get("x-forwarded-proto") === "https";

    const response = NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      data: {
        user: {
          id:       user.id,
          name:     user.name,
          email:    user.email,
          role:     user.role.name,
          company:  user.company.name,
          avatar:   user.avatar,
        },
      },
    });

    response.cookies.set("tashgheel_access", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    response.cookies.set("tashgheel_refresh", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[Login API]", error);
    
    // Check if Prisma connection error
    const errorMessage = error?.message || "";
    if (
      errorMessage.includes("Can't reach database") ||
      errorMessage.includes("P1001") ||
      errorMessage.includes("P1002") ||
      errorMessage.includes("PrismaClientInitializationError") ||
      errorMessage.includes("Environment variable not found")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "تعذر الاتصال بقاعدة البيانات. يرجى التأكد من إعداد DATABASE_URL وتشغيل npm run db:push ثم npm run db:seed",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, message: "حدث خطأ في الخادم أثناء تسجيل الدخول: " + (error?.message || "") },
      { status: 500 }
    );
  }
}
