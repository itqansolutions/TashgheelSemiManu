import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const repurchaseSchema = z.object({
  supplierId: z.string().min(1, "اختر المورد"),
  quantity: z.number().min(0.01, "الكمية يجب أن تكون أكبر من 0"),
  unitPrice: z.number().min(0, "سعر الشراء الفردي مطلوب"),
  paymentType: z.enum(["CREDIT", "CASH"]).default("CREDIT"),
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = repurchaseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "بيانات غير صحيحة" }, { status: 400 });
    }

    const item = await prisma.item.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ success: false, message: "الصنف غير موجود" }, { status: 404 });
    }

    const supplier = await prisma.supplier.findUnique({ where: { id: parsed.data.supplierId } });
    if (!supplier) {
      return NextResponse.json({ success: false, message: "المورد غير موجود" }, { status: 404 });
    }

    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json({ success: false, message: "الشركة غير موجودة" }, { status: 400 });
    }

    const totalAmount = parsed.data.quantity * parsed.data.unitPrice;
    const isCash = parsed.data.paymentType === "CASH";

    // Auto-generate Purchase Invoice Number
    const invCount = await prisma.purchaseInvoice.count({ where: { companyId: company.id } });
    const invoiceNo = `PINV-${new Date().getFullYear()}-${(invCount + 1).toString().padStart(4, "0")}`;

    const purchaseInvoice = await prisma.purchaseInvoice.create({
      data: {
        companyId: company.id,
        supplierId: supplier.id,
        invoiceNo,
        status: isCash ? "CLOSED" : "APPROVED",
        date: new Date(),
        subtotal: totalAmount,
        total: totalAmount,
        paidAmount: isCash ? totalAmount : 0,
        remainingAmount: isCash ? 0 : totalAmount,
        currency: "EGP",
        notes: parsed.data.notes ? `[إعادة شراء] ${parsed.data.notes}` : `إعادة شراء صنف: ${item.name}`,
        items: {
          create: [
            {
              itemId: item.id,
              description: item.name,
              quantity: parsed.data.quantity,
              unitPrice: parsed.data.unitPrice,
              total: totalAmount,
            },
          ],
        },
      },
    });

    // If Cash Payment: create Supplier Payment record automatically
    if (isCash) {
      const payCount = await prisma.supplierPayment.count({ where: { companyId: company.id } });
      const voucherNo = `PAY-${new Date().getFullYear()}-${(payCount + 1).toString().padStart(4, "0")}`;

      await prisma.supplierPayment.create({
        data: {
          companyId: company.id,
          supplierId: supplier.id,
          invoiceId: purchaseInvoice.id,
          voucherNo,
          amount: totalAmount,
          status: "APPROVED",
          date: new Date(),
          notes: `سداد نقدي مباشر عند إعادة شراء صنف: ${item.name} (فاتورة ${invoiceNo})`,
        },
      });
    }

    // Update item default cost price if updated
    await prisma.item.update({
      where: { id: item.id },
      data: { defaultCost: parsed.data.unitPrice },
    });

    return NextResponse.json({
      success: true,
      message: isCash
        ? "تم تسجيل فاتورة الشراء والسداد النقدي الفوري للمورد بنجاح"
        : "تم تسجيل فاتورة الشراء بالأجل على حساب المورد بنجاح",
      data: purchaseInvoice,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "فشل تسجيل شراء الصنف: " + (error?.message || "") },
      { status: 500 }
    );
  }
}
