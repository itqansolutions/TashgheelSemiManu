import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseInvoices: {
          where: { deletedAt: null },
          orderBy: { date: "asc" },
        },
        payments: {
          where: { deletedAt: null },
          orderBy: { date: "asc" },
        },
      },
    });

    if (!supplier) {
      return NextResponse.json({ success: false, message: "المورد غير موجود" }, { status: 404 });
    }

    const openingBalance = Number(supplier.openingBalance || 0);

    // Combine transactions
    const rawTx: Array<{
      id: string;
      date: Date;
      type: "PURCHASE" | "PAYMENT";
      docNo: string;
      description: string;
      credit: number; // دائن (مشتريات للمورد)
      debit: number;  // مدين (سداد للمورد)
      notes?: string | null;
    }> = [];

    supplier.purchaseInvoices.forEach((inv) => {
      rawTx.push({
        id: inv.id,
        date: new Date(inv.date),
        type: "PURCHASE",
        docNo: inv.invoiceNo,
        description: "فاتورة مشتريات خامات / توريد",
        credit: Number(inv.total),
        debit: 0,
        notes: inv.notes,
      });
    });

    supplier.payments.forEach((pay) => {
      rawTx.push({
        id: pay.id,
        date: new Date(pay.date),
        type: "PAYMENT",
        docNo: pay.voucherNo,
        description: pay.referenceNo ? `سداد للمورد / مرجع: ${pay.referenceNo}` : "سداد للمورد / سند صرف",
        credit: 0,
        debit: Number(pay.amount),
        notes: pay.notes,
      });
    });

    // Sort by date ascending
    rawTx.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate running balance after each transaction
    let runningBalance = openingBalance;
    const statementLines = rawTx.map((tx) => {
      runningBalance = runningBalance + tx.credit - tx.debit;
      return {
        ...tx,
        balanceAfter: runningBalance,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        supplier: {
          id: supplier.id,
          name: supplier.name,
          phone: supplier.phone,
          taxNumber: supplier.taxNumber,
          address: supplier.address,
        },
        openingBalance,
        transactions: statementLines,
        finalBalance: runningBalance,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "فشل جلب كشف حساب المورد" }, { status: 500 });
  }
}
