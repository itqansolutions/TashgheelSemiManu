import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const item = await prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ success: false, message: "الصنف غير موجود" }, { status: 404 });
    }

    // Fetch purchase history for this item
    const purchaseLineItems = await prisma.purchaseInvoiceItem.findMany({
      where: {
        OR: [
          { itemId: item.id },
          { description: { contains: item.name } }
        ],
        purchaseInvoice: {
          deletedAt: null,
          status: { notIn: ["CANCELLED", "REJECTED"] },
        },
      },
      include: {
        purchaseInvoice: {
          include: {
            supplier: { select: { id: true, name: true, phone: true } },
          },
        },
      },
      orderBy: { purchaseInvoice: { date: "desc" } },
    });

    // Fetch sales history for this item
    const saleLineItems = await prisma.invoiceItem.findMany({
      where: {
        OR: [
          { itemId: item.id },
          { description: { contains: item.name } }
        ],
        invoice: {
          deletedAt: null,
          status: { notIn: ["CANCELLED", "REJECTED"] },
        },
      },
      include: {
        invoice: {
          include: {
            customer: { select: { id: true, name: true, phone: true } },
          },
        },
      },
      orderBy: { invoice: { date: "desc" } },
    });

    const purchases = purchaseLineItems.map((p) => ({
      id: p.id,
      date: p.purchaseInvoice.date,
      invoiceNo: p.purchaseInvoice.invoiceNo,
      supplierName: p.purchaseInvoice.supplier?.name ?? "مورد غير معروف",
      quantity: Number(p.quantity),
      unitPrice: Number(p.unitPrice),
      total: Number(p.total),
      status: p.purchaseInvoice.status,
    }));

    const sales = saleLineItems.map((s) => ({
      id: s.id,
      date: s.invoice.date,
      invoiceNo: s.invoice.invoiceNo,
      customerName: s.invoice.customer?.name ?? "عميل غير معروف",
      quantity: Number(s.quantity),
      unitPrice: Number(s.unitPrice),
      total: Number(s.total),
      status: s.invoice.status,
    }));

    const totalPurchasedQty = purchases.reduce((sum, p) => sum + p.quantity, 0);
    const totalSoldQty = sales.reduce((sum, s) => sum + s.quantity, 0);
    const remainingStock = totalPurchasedQty - totalSoldQty;

    return NextResponse.json({
      success: true,
      data: {
        item: {
          id: item.id,
          name: item.name,
          code: item.code,
          defaultCost: Number(item.defaultCost),
          defaultPrice: Number(item.defaultPrice),
        },
        purchases,
        sales,
        summary: {
          totalPurchasedQty,
          totalSoldQty,
          remainingStock,
          purchaseCount: purchases.length,
          salesCount: sales.length,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "فشل جلب بيانات كارت الصنف: " + (error?.message || "") },
      { status: 500 }
    );
  }
}
