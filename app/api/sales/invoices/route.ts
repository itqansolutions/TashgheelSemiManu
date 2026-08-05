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

const invoiceSchema = z.object({
  customerName: z.string().min(1, "اسم العميل مطلوب"),
  subject: z.string().min(1, "موضوع الفاتورة مطلوب"),
  totalAmount: z.number().min(0),
  discountType: z.enum(["percentage", "fixed"]).optional().default("fixed"),
  discountValue: z.number().min(0).optional().default(0),
  taxPercent: z.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  lineItems: z.array(lineItemSchema).optional(),
});

export async function GET() {
  try {
    const invoices = await prisma.customerInvoice.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        customer: { select: { id: true, name: true } },
        items: true,
      },
    });
    return NextResponse.json({ success: true, data: invoices });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "فشل جلب الفواتير: " + (error?.message || "") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = invoiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "بيانات غير صحيحة" }, { status: 400 });
    }

    const company = await prisma.company.findFirst();
    const branch = await prisma.branch.findFirst();

    if (!company) {
      return NextResponse.json({ success: false, message: "لم يتم العثور على الشركة" }, { status: 400 });
    }

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: { name: parsed.data.customerName.trim(), companyId: company.id },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { companyId: company.id, name: parsed.data.customerName.trim() },
      });
    }

    // Auto-generate invoice number
    const count = await prisma.customerInvoice.count({ where: { companyId: company.id } });
    const invoiceNo = `INV-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, "0")}`;

    const subtotal = parsed.data.totalAmount;
    const discountType = parsed.data.discountType;
    const discountValue = parsed.data.discountValue;

    let discountAmount = 0;
    if (discountType === "percentage") {
      discountAmount = (subtotal * discountValue) / 100;
    } else {
      discountAmount = discountValue;
    }

    const taxableSubtotal = Math.max(0, subtotal - discountAmount);
    const taxAmount = taxableSubtotal * (parsed.data.taxPercent / 100);
    const total = taxableSubtotal + taxAmount;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const lineItems = parsed.data.lineItems ?? [];

    const invoice = await prisma.customerInvoice.create({
      data: {
        companyId: company.id,
        branchId: branch?.id,
        invoiceNo,
        customerId: customer.id,
        status: "DRAFT",
        date: new Date(),
        dueDate,
        subtotal,
        discountType,
        discountValue,
        discountAmount,
        taxAmount,
        total,
        paidAmount: 0,
        remainingAmount: total,
        currency: "EGP",
        notes: parsed.data.notes,
        termsConditions: parsed.data.subject,
        items: {
          create: lineItems.map((li, i) => ({
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
      },
      include: {
        customer: { select: { id: true, name: true } },
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم إنشاء الفاتورة بنجاح",
      data: invoice,
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ success: false, message: "رقم الفاتورة موجود بالفعل، حاول مرة أخرى" }, { status: 409 });
    }
    return NextResponse.json(
      { success: false, message: "حدث خطأ: " + (error?.message || "") },
      { status: 500 }
    );
  }
}
