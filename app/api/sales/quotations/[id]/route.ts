import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const lineItemSchema = z.object({
  itemId: z.string().optional(),
  serviceId: z.string().optional(),
  description: z.string().min(1),
  quantity: z.number().default(1),
  unitPrice: z.number().default(0),
  total: z.number().default(0),
  notes: z.string().optional(),
});

const updateQuotationSchema = z.object({
  customerName: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  totalAmount: z.number().min(0).optional(),
  discountType: z.enum(["percentage", "fixed"]).optional(),
  discountValue: z.number().min(0).optional(),
  notes: z.string().optional(),
  status: z.string().optional(),
  validDays: z.number().optional(),
  lineItems: z.array(lineItemSchema).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = updateQuotationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "بيانات غير صحيحة" }, { status: 400 });
    }

    const existing = await prisma.quotation.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) {
      return NextResponse.json({ success: false, message: "عرض السعر غير موجود" }, { status: 404 });
    }

    let customerId = existing.customerId;
    if (parsed.data.customerName) {
      let cust = await prisma.customer.findFirst({
        where: { name: parsed.data.customerName.trim(), companyId: existing.companyId },
      });
      if (!cust) {
        cust = await prisma.customer.create({
          data: { companyId: existing.companyId, name: parsed.data.customerName.trim() },
        });
      }
      customerId = cust.id;
    }

    const subtotal = parsed.data.totalAmount ?? Number(existing.subtotal);
    const discountType = parsed.data.discountType ?? existing.discountType ?? "fixed";
    const discountValue = parsed.data.discountValue ?? Number(existing.discountValue);

    let discountAmount = 0;
    if (discountType === "percentage") {
      discountAmount = (subtotal * discountValue) / 100;
    } else {
      discountAmount = discountValue;
    }

    const total = Math.max(0, subtotal - discountAmount);

    // If lineItems provided, recreate them
    if (parsed.data.lineItems) {
      await prisma.quotationItem.deleteMany({ where: { quotationId: id } });
    }

    const updated = await prisma.quotation.update({
      where: { id },
      data: {
        customerId,
        ...(parsed.data.subject && { termsConditions: parsed.data.subject }),
        subtotal,
        discountType,
        discountValue,
        discountAmount,
        total,
        ...(parsed.data.notes !== undefined && { notes: parsed.data.notes }),
        ...(parsed.data.status && { status: parsed.data.status as any }),
        ...(parsed.data.lineItems && {
          items: {
            create: parsed.data.lineItems.map((li, i) => ({
              description: li.description,
              quantity: li.quantity,
              unitPrice: li.unitPrice,
              total: li.total,
              notes: li.notes,
              sortOrder: i + 1,
              itemId: li.itemId || undefined,
              serviceId: li.serviceId || undefined,
            })),
          },
        }),
      },
      include: {
        customer: { select: { id: true, name: true } },
        items: true,
      },
    });

    return NextResponse.json({ success: true, message: "تم تحديث عرض السعر بنجاح", data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "حدث خطأ: " + error?.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.quotation.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ success: true, message: "تم حذف عرض السعر بنجاح" });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: "حدث خطأ: " + error?.message }, { status: 500 });
  }
}
