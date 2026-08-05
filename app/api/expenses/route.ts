import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const expenseSchema = z.object({
  description: z.string().min(1, "وصف المصروف مطلوب"),
  amount: z.number().min(0.01, "المبلغ يجب أن يكون أكبر من 0"),
  referenceNo: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ success: true, data: expenses });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "فشل جلب المصروفات: " + (error?.message || "") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = expenseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "بيانات غير صحيحة" }, { status: 400 });
    }

    const company = await prisma.company.findFirst();
    const branch = await prisma.branch.findFirst();

    if (!company) {
      return NextResponse.json({ success: false, message: "لم يتم العثور على الشركة" }, { status: 400 });
    }

    const count = await prisma.expense.count({ where: { companyId: company.id } });
    const expenseNo = `EXP-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, "0")}`;

    const expense = await prisma.expense.create({
      data: {
        companyId: company.id,
        branchId: branch?.id,
        expenseNo,
        description: parsed.data.description,
        amount: parsed.data.amount,
        referenceNo: parsed.data.referenceNo,
        notes: parsed.data.notes,
        status: "APPROVED",
        date: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تسجيل المصروف بنجاح",
      data: expense,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ: " + (error?.message || "") },
      { status: 500 }
    );
  }
}
