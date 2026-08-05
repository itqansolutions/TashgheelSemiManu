import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const updateSchema = z.object({
  status: z.string().optional(),
  notes: z.string().optional(),
  actualCost: z.number().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const jobOrder = await prisma.jobOrder.findUnique({
      where: { id },
      include: { customer: true, timeline: true },
    });
    if (!jobOrder) {
      return NextResponse.json({ success: false, message: "لم يتم العثور على أمر العمل" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: jobOrder });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message }, { status: 500 });
  }
}

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

    const updated = await prisma.jobOrder.update({
      where: { id },
      data: {
        ...(parsed.data.status && { status: parsed.data.status as any }),
        ...(parsed.data.notes !== undefined && { notes: parsed.data.notes }),
        ...(parsed.data.actualCost !== undefined && { actualCost: parsed.data.actualCost }),
      },
      include: { customer: true },
    });

    return NextResponse.json({
      success: true,
      message: "تم تحديث أمر العمل",
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message }, { status: 500 });
  }
}
