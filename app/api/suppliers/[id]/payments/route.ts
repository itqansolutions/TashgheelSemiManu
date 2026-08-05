import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const paymentSchema = z.object({
  amount: z.number().min(0.01, "المبلغ يجب أن يكون أكبر من 0"),
  referenceNo: z.string().optional(),
  notes: z.string().optional(),
  attachmentName: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = paymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "بيانات سداد غير صحيحة" }, { status: 400 });
    }

    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      return NextResponse.json({ success: false, message: "المورد غير موجود" }, { status: 404 });
    }

    const company = await prisma.company.findFirst();
    const count = await prisma.supplierPayment.count({ where: { companyId: company?.id ?? supplier.companyId } });
    const voucherNo = `PAY-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, "0")}`;

    const notesWithAttachment = parsed.data.attachmentName
      ? `${parsed.data.notes || ""} [مرفق: ${parsed.data.attachmentName}]`.trim()
      : parsed.data.notes;

    const payment = await prisma.supplierPayment.create({
      data: {
        companyId: company?.id ?? supplier.companyId,
        supplierId: supplier.id,
        voucherNo,
        amount: parsed.data.amount,
        referenceNo: parsed.data.referenceNo,
        notes: notesWithAttachment,
        status: "APPROVED",
        date: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تسجيل سند الصرف والسداد للمورد بنجاح",
      data: payment,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "فشل تسجيل سداد المورد" }, { status: 500 });
  }
}
