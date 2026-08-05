import { NextResponse } from "next/server";
import { getDashboardStatsData } from "@/lib/stats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getDashboardStatsData();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "فشل جلب إحصائيات لوحة التحكم: " + (error?.message || "") },
      { status: 500 }
    );
  }
}
