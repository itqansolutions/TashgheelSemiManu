// ============================================================
// Tashgheel — Get Current User API
// GET /api/auth/me
// ============================================================

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "غير مصرح" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      role: { select: { name: true } },
      company: { select: { name: true, logo: true, currency: true } },
      branch: { select: { name: true } },
    },
  });

  if (!user || user.deletedAt || user.status !== "ACTIVE") {
    return NextResponse.json(
      { success: false, message: "المستخدم غير نشط" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      id:          user.id,
      name:        user.name,
      email:       user.email,
      phone:       user.phone,
      avatar:      user.avatar,
      isOwner:     user.isOwner,
      role:        user.role.name,
      roleId:      user.roleId,
      companyId:   user.companyId,
      company:     user.company.name,
      companyLogo: user.company.logo,
      currency:    user.company.currency,
      branchId:    user.branchId,
      branch:      user.branch?.name,
    },
  });
}
