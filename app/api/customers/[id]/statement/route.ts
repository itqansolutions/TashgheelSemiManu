import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        invoices: {
          where: { deletedAt: null },
          orderBy: { date: "asc" },
        },
        receipts: {
          where: { deletedAt: null },
          orderBy: { date: "asc" },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ success: false, message: "العميل غير موجود" }, { status: 404 });
    }

    const openingBalance = Number(customer.openingBalance || 0);

    // Combine transactions
    const rawTx: Array<{
      id: string;
      date: Date;
      type: "INVOICE" | "PAYMENT";
      docNo: string;
      description: string;
      debit: number; // مدين (فواتير)
      credit: number; // دائن (سداد)
      notes?: string | null;
    }> = [];

    customer.invoices.forEach((inv) => {
      rawTx.push({
        id: inv.id,
        date: new Date(inv.date),
        type: "INVOICE",
        docNo: inv.invoiceNo,
        description: inv.termsConditions || "فاتورة مبيعات",
        debit: Number(inv.total),
        credit: 0,
        notes: inv.notes,
      });
    });

    customer.receipts.forEach((pay) => {
      rawTx.push({
        id: pay.id,
        date: new Date(pay.date),
        type: "PAYMENT",
        docNo: pay.receiptNo,
        description: pay.referenceNo ? `سداد نقدي / مرجع: ${pay.referenceNo}` : "سداد نقدي / سند قبض",
        debit: 0,
        credit: Number(pay.amount),
        notes: pay.notes,
      });
    });

    // Sort by date ascending
    rawTx.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate running balance after each transaction
    let runningBalance = openingBalance;
    const statementLines = rawTx.map((tx) => {
      runningBalance = runningBalance + tx.debit - tx.credit;
      return {
        ...tx,
        balanceAfter: runningBalance,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        customer: {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          taxNumber: customer.taxNumber,
          address: customer.address,
        },
        openingBalance,
        transactions: statementLines,
        finalBalance: runningBalance,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "فشل جلب كشف الحساب" }, { status: 500 });
  }
}
