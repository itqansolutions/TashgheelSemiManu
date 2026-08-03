import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const jobOrderSchema = z.object({
  customerName: z.string().min(1, "اسم العميل مطلوب"),
  productName: z.string().min(1, "اسم المنتج أو الخدمة مطلوب"),
  totalAmount: z.number().min(0, "المبلغ يجب أن يكون موجباً"),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const jobOrders = await prisma.jobOrder.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        customer: true,
      },
    });
    return NextResponse.json({ success: true, data: jobOrders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "فشل جلب أوامر التشغيل: " + (error?.message || "") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = jobOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "بيانات أمر العمل غير صحيحة" },
        { status: 400 }
      );
    }

    const company = await prisma.company.findFirst();
    const branch = await prisma.branch.findFirst();

    if (!company || !branch) {
      return NextResponse.json(
        { success: false, message: "لم يتم العثور على الشركة أو الفرع" },
        { status: 400 }
      );
    }

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: { name: parsed.data.customerName.trim() },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          companyId: company.id,
          name: parsed.data.customerName.trim(),
        },
      });
    }

    // Generate Job Order Number
    const count = await prisma.jobOrder.count();
    const orderNumber = `JO-${new Date().getFullYear()}-${(count + 1)
      .toString()
      .padStart(4, "0")}`;

    const jobOrder = await prisma.jobOrder.create({
      data: {
        companyId: company.id,
        branchId: branch.id,
        customerId: customer.id,
        jobNo: orderNumber,
        title: parsed.data.productName,
        status: "IN_PRODUCTION",
        estimatedCost: parsed.data.totalAmount * 0.7,
        notes: parsed.data.notes,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم إنشاء أمر العمل بنجاح",
      data: {
        id: jobOrder.jobNo,
        customer: customer.name,
        product: jobOrder.title,
        status: "قيد التشغيل",
        statusColor: "#0284c7",
        date: "الآن",
        amount: `${parsed.data.totalAmount.toLocaleString()} ج.م`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء إنشاء أمر العمل: " + (error?.message || "") },
      { status: 500 }
    );
  }
}
