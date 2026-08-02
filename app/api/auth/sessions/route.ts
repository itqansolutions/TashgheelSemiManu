// ============================================================
// Tashgheel — Sessions Management API
// GET /api/auth/sessions — Get all active sessions
// DELETE /api/auth/sessions/[id] — Revoke specific session
// DELETE /api/auth/sessions — Revoke all other sessions
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { formatDateTime } from "@/utils";

// ─── GET: List all sessions ───────────────────────────────────

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "غير مصرح" }, { status: 401 });
  }

  const sessions = await prisma.session.findMany({
    where: {
      userId: session.userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { lastActive: "desc" },
    select: {
      id:         true,
      deviceName: true,
      deviceType: true,
      browser:    true,
      os:         true,
      ipAddress:  true,
      lastActive: true,
      expiresAt:  true,
      createdAt:  true,
    },
  });

  return NextResponse.json({
    success: true,
    data: sessions.map((s) => ({
      ...s,
      isCurrent: s.id === session.sessionId,
      lastActiveFormatted: formatDateTime(s.lastActive),
    })),
  });
}

// ─── DELETE: Revoke all other sessions ───────────────────────

export async function DELETE(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const sessionId = body.sessionId;

  if (sessionId) {
    // Delete specific session (not current)
    if (sessionId === session.sessionId) {
      return NextResponse.json(
        { success: false, message: "لا يمكن إلغاء الجلسة الحالية" },
        { status: 400 }
      );
    }

    await prisma.session.delete({ where: { id: sessionId } });

    return NextResponse.json({
      success: true,
      message: "تم إلغاء الجلسة بنجاح",
    });
  }

  // Delete all except current
  await prisma.session.deleteMany({
    where: {
      userId: session.userId,
      id:     { not: session.sessionId },
    },
  });

  return NextResponse.json({
    success: true,
    message: "تم تسجيل الخروج من جميع الأجهزة الأخرى",
  });
}
