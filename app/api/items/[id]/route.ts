import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  sku: z.string().optional(),
  costPrice: z.number().optional(),
  salePrice: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "بيانات غير صحيحة" }, { status: 400 });
    }

    const updated = await prisma.item.update({
      where: { id },
      data: {
        ...(parsed.data.name && { name: parsed.data.name }),
        ...(parsed.data.sku !== undefined && { code: parsed.data.sku }),
        ...(parsed.data.costPrice !== undefined && { defaultCost: parsed.data.costPrice }),
        ...(parsed.data.salePrice !== undefined && { defaultPrice: parsed.data.salePrice }),
        ...(parsed.data.isActive !== undefined && { isActive: parsed.data.isActive }),
      },
    });

    return NextResponse.json({ success: true, message: "تم تحديث الصنف", data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ: " + (error?.message || "") },
      { status: 500 }
    );
  }
}
