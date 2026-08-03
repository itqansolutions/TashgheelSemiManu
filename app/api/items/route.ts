import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const itemSchema = z.object({
  name: z.string().min(1, "اسم الصنف مطلوب"),
  sku: z.string().optional(),
  unit: z.string().default("قطعة"),
  costPrice: z.number().min(0).default(0),
  salePrice: z.number().min(0).default(0),
  minStock: z.number().min(0).default(0),
  initialStock: z.number().min(0).default(0),
});

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "فشل جلب قائمة الأصناف: " + (error?.message || "") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = itemSchema.safeParse(body);

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

    const item = await prisma.item.create({
      data: {
        companyId: company.id,
        name: parsed.data.name,
        code: parsed.data.sku || `ITEM-${Date.now().toString().slice(-6)}`,
        defaultCost: parsed.data.costPrice,
        defaultPrice: parsed.data.salePrice,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم إضافة الصنف للمخزن بنجاح",
      data: item,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء إضافة الصنف: " + (error?.message || "") },
      { status: 500 }
    );
  }
}
