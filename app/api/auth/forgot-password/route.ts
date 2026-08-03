import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "البريد الإلكتروني غير صحيح" },
        { status: 400 }
      );
    }

    // Always return success to prevent email enumeration attacks
    return NextResponse.json({
      success: true,
      message: "إذا كان البريد الإلكتروني مسجلاً لدينا، فستصلك تعليمات استعادة كلمة المرور قريباً.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء معالجة الطلب" },
      { status: 500 }
    );
  }
}
