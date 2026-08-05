import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const serviceSchema = z.object({
  name: z.string().min(1, "اسم الخدمة مطلوب"),
  code: z.string().optional(),
  defaultCost: z.number().min(0).default(0),
  defaultPrice: z.number().min(0).default(0),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ success: true, data: services });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "فشل جلب الخدمات: " + (error?.message || "") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = serviceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "بيانات غير صحيحة" }, { status: 400 });
    }

    const company = await prisma.company.findFirst();
    const branch = await prisma.branch.findFirst();

    if (!company) {
      return NextResponse.json({ success: false, message: "لم يتم العثور على الشركة" }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        companyId: company.id,
        branchId: branch?.id,
        name: parsed.data.name,
        code: parsed.data.code,
        defaultCost: parsed.data.defaultCost,
        defaultPrice: parsed.data.defaultPrice,
        description: parsed.data.description,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم إضافة الخدمة بنجاح",
      data: service,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ: " + (error?.message || "") },
      { status: 500 }
    );
  }
}
