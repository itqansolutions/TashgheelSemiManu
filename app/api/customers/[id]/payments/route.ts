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

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return NextResponse.json({ success: false, message: "العميل غير موجود" }, { status: 404 });
    }

    const company = await prisma.company.findFirst();
    const count = await prisma.customerPayment.count({ where: { companyId: company?.id ?? customer.companyId } });
    const receiptNo = `REC-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, "0")}`;

    const notesWithAttachment = parsed.data.attachmentName
      ? `${parsed.data.notes || ""} [مرفق: ${parsed.data.attachmentName}]`.trim()
      : parsed.data.notes;

    const payment = await prisma.customerPayment.create({
      data: {
        companyId: company?.id ?? customer.companyId,
        customerId: customer.id,
        receiptNo,
        amount: parsed.data.amount,
        referenceNo: parsed.data.referenceNo,
        notes: notesWithAttachment,
        status: "APPROVED",
        date: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تسجيل سند القبض والسداد بنجاح",
      data: payment,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "فشل تسجيل السداد" }, { status: 500 });
  }
}
