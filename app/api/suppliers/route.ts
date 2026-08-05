import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const supplierSchema = z.object({
  name: z.string().min(1, "اسم المورد مطلوب"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  taxNumber: z.string().optional(),
  address: z.string().optional(),
  openingBalance: z.number().optional().default(0),
});

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ success: true, data: suppliers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "فشل جلب قائمة الموردين: " + (error?.message || "") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = supplierSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "بيانات غير صحيحة" },
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

    const supplier = await prisma.supplier.create({
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
      message: "تم إضافة المورد بنجاح",
      data: supplier,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ: " + (error?.message || "") },
      { status: 500 }
    );
  }
}
