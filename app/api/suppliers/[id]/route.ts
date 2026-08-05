import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  taxNumber: z.string().optional(),
  address: z.string().optional(),
  openingBalance: z.number().optional(),
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
    const updated = await prisma.supplier.update({
      where: { id },
      data: {
        ...(parsed.data.name && { name: parsed.data.name }),
        ...(parsed.data.phone !== undefined && { phone: parsed.data.phone }),
        ...(parsed.data.email !== undefined && { email: parsed.data.email || null }),
        ...(parsed.data.taxNumber !== undefined && { taxNumber: parsed.data.taxNumber }),
        ...(parsed.data.address !== undefined && { address: parsed.data.address }),
        ...(parsed.data.openingBalance !== undefined && { openingBalance: parsed.data.openingBalance }),
        ...(parsed.data.isActive !== undefined && { isActive: parsed.data.isActive }),
      },
    });
    return NextResponse.json({ success: true, message: "تم تحديث المورد", data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message }, { status: 500 });
  }
}
