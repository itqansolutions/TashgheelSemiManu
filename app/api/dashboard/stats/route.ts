import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json({
        success: true,
        data: {
          totalSales: 0,
          activeJobOrders: 0,
          itemsCount: 0,
          customersCount: 0,
          suppliersCount: 0,
          quotationsCount: 0,
          recentJobOrders: [],
        },
      });
    }

    const [
      invoicesAggregate,
      activeJobOrders,
      itemsCount,
      customersCount,
      suppliersCount,
      quotationsCount,
      recentJobOrders,
    ] = await Promise.all([
      prisma.customerInvoice.aggregate({
        where: { companyId: company.id, deletedAt: null },
        _sum: { total: true },
      }),
      prisma.jobOrder.count({
        where: {
          companyId: company.id,
          status: { in: ["IN_PRODUCTION", "IN_FINISHING", "INSTALLING", "PURCHASING", "APPROVED"] },
          deletedAt: null,
        },
      }),
      prisma.item.count({
        where: { companyId: company.id, isActive: true, deletedAt: null },
      }),
      prisma.customer.count({
        where: { companyId: company.id, isActive: true, deletedAt: null },
      }),
      prisma.supplier.count({
        where: { companyId: company.id, isActive: true, deletedAt: null },
      }),
      prisma.quotation.count({
        where: { companyId: company.id, deletedAt: null },
      }),
      prisma.jobOrder.findMany({
        where: { companyId: company.id, deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { customer: { select: { id: true, name: true } } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalSales: Number(invoicesAggregate._sum.total ?? 0),
        activeJobOrders,
        itemsCount,
        customersCount,
        suppliersCount,
        quotationsCount,
        recentJobOrders,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "فشل جلب إحصائيات لوحة التحكم: " + (error?.message || "") },
      { status: 500 }
    );
  }
}
