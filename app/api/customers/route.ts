import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const customerSchema = z.object({
  name: z.string().min(1, "اسم العميل مطلوب"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  taxNumber: z.string().optional(),
  address: z.string().optional(),
  openingBalance: z.number().optional().default(0),
});

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        invoices: {
          where: { deletedAt: null, status: { notIn: ["CANCELLED", "REJECTED"] } },
          select: { total: true },
        },
        receipts: {
          where: { deletedAt: null },
          select: { amount: true },
        },
      },
      take: 100,
    });

    const data = customers.map((c) => {
      const invTotal = c.invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
      const recTotal = c.receipts.reduce((sum, rec) => sum + Number(rec.amount || 0), 0);
      const currentBalance = Number(c.openingBalance || 0) + invTotal - recTotal;
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        address: c.address,
        taxNumber: c.taxNumber,
        openingBalance: Number(c.openingBalance || 0),
        currentBalance,
        isActive: c.isActive,
        createdAt: c.createdAt,
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "فشل جلب قائمة العملاء: " + (error?.message || "") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = customerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "بيانات غير صحيحة", errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json(
        { success: false, message: "لم يتم العثور على الشركة" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        companyId: company.id,
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        taxNumber: parsed.data.taxNumber,
        address: parsed.data.address,
        openingBalance: parsed.data.openingBalance,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم إضافة العميل بنجاح",
      data: {
        ...customer,
        currentBalance: Number(customer.openingBalance || 0),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء إضافة العميل: " + (error?.message || "") },
      { status: 500 }
    );
  }
}
