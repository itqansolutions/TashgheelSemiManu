import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const quotationSchema = z.object({
  customerName: z.string().min(1, "اسم العميل مطلوب"),
  subject: z.string().min(1, "موضوع عرض السعر مطلوب"),
  totalAmount: z.number().min(0),
  notes: z.string().optional(),
  validDays: z.number().default(30),
});

export async function GET() {
  try {
    const quotations = await prisma.quotation.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        customer: {
          select: { id: true, name: true, phone: true, email: true },
        },
      },
    });
    return NextResponse.json({ success: true, data: quotations });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "فشل جلب عروض الأسعار: " + (error?.message || "") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = quotationSchema.safeParse(body);

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

    // Auto-generate quotation number
    const count = await prisma.quotation.count({ where: { companyId: company.id } });
    const quotationNo = `QUO-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, "0")}`;

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + parsed.data.validDays);

    const quotation = await prisma.quotation.create({
      data: {
        companyId: company.id,
        branchId: branch?.id,
        quotationNo,
        customerId: customer.id,
        status: "DRAFT",
        date: new Date(),
        validUntil,
        subtotal: parsed.data.totalAmount,
        discountValue: 0,
        discountAmount: 0,
        taxAmount: 0,
        total: parsed.data.totalAmount,
        currency: "EGP",
        notes: parsed.data.notes,
        termsConditions: parsed.data.subject,
      },
      include: {
        customer: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم إنشاء عرض السعر بنجاح",
      data: quotation,
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ success: false, message: "رقم عرض السعر موجود بالفعل، حاول مرة أخرى" }, { status: 409 });
    }
    return NextResponse.json(
      { success: false, message: "حدث خطأ: " + (error?.message || "") },
      { status: 500 }
    );
  }
}
