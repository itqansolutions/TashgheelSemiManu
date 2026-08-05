import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const cashAccountSchema = z.object({
  name: z.string().min(1, "اسم الخزينة مطلوب"),
  openingBalance: z.number().default(0),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const cashAccounts = await prisma.cashAccount.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ success: true, data: cashAccounts });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "فشل جلب الخزائن: " + (error?.message || "") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = cashAccountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "بيانات غير صحيحة" }, { status: 400 });
    }

    const company = await prisma.company.findFirst();
    const branch = await prisma.branch.findFirst();

    if (!company) {
      return NextResponse.json({ success: false, message: "لم يتم العثور على الشركة" }, { status: 400 });
    }

    const account = await prisma.cashAccount.create({
      data: {
        companyId: company.id,
        branchId: branch?.id,
        name: parsed.data.name,
        openingBalance: parsed.data.openingBalance,
        currency: "EGP",
        notes: parsed.data.notes,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم إضافة الخزينة بنجاح",
      data: account,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ: " + (error?.message || "") },
      { status: 500 }
    );
  }
}
