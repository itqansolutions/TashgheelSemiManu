import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const costingSchema = z.object({
  itemCosts: z.array(
    z.object({
      id: z.string().min(1),
      cost: z.number().min(0),
    })
  ),
  expenses: z.array(
    z.object({
      id: z.string().optional(),
      categoryId: z.string().optional(),
      description: z.string().min(1, "وصف المصروف مطلوب"),
      amount: z.number().min(0, "مبلغ المصروف يجب أن يكون 0 أو أكثر"),
    })
  ).optional().default([]),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const invoice = await prisma.customerInvoice.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ success: false, message: "الفاتورة غير موجودة" }, { status: 404 });
    }

    const linkedExpenses = await prisma.expense.findMany({
      where: {
        invoiceId: id,
        deletedAt: null,
      },
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalSales = Number(invoice.total || 0);
    const totalDirectCost = invoice.items.reduce((sum, item) => sum + (Number(item.cost || 0) * Number(item.quantity || 1)), 0);
    const totalLinkedExpenses = linkedExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    const totalCost = totalDirectCost + totalLinkedExpenses;
    const netProfit = totalSales - totalCost;
    const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        invoice: {
          id: invoice.id,
          invoiceNo: invoice.invoiceNo,
          customerName: invoice.customer?.name ?? "عميل غير معروف",
          date: invoice.date,
          status: invoice.status,
          totalSales,
          termsConditions: invoice.termsConditions,
        },
        items: invoice.items.map((i) => ({
          id: i.id,
          description: i.description,
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
          total: Number(i.total),
          unitCost: Number(i.cost || 0),
          totalCost: Number(i.cost || 0) * Number(i.quantity),
        })),
        linkedExpenses: linkedExpenses.map((e) => ({
          id: e.id,
          categoryId: e.categoryId,
          categoryName: e.category?.name ?? "عام",
          description: e.description,
          amount: Number(e.amount),
        })),
        summary: {
          totalSales,
          totalDirectCost,
          totalLinkedExpenses,
          totalCost,
          netProfit,
          profitMargin,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "فشل جلب تكاليف الفاتورة: " + (error?.message || "") },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = costingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "بيانات تكاليف غير صحيحة" }, { status: 400 });
    }

    const invoice = await prisma.customerInvoice.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!invoice) {
      return NextResponse.json({ success: false, message: "الفاتورة غير موجودة" }, { status: 404 });
    }

    const company = await prisma.company.findFirst();

    // 1. Update items cost
    for (const itemCost of parsed.data.itemCosts) {
      await prisma.invoiceItem.update({
        where: { id: itemCost.id },
        data: { cost: itemCost.cost },
      });
    }

    // 2. Sync linked expenses
    const currentLinked = await prisma.expense.findMany({
      where: { invoiceId: id, deletedAt: null },
    });

    const incomingExpenseIds = parsed.data.expenses.map((e) => e.id).filter(Boolean) as string[];

    // Unlink expenses that were removed from this invoice
    for (const cur of currentLinked) {
      if (!incomingExpenseIds.includes(cur.id)) {
        await prisma.expense.update({
          where: { id: cur.id },
          data: { invoiceId: null },
        });
      }
    }

    // Create or update incoming expenses
    for (const exp of parsed.data.expenses) {
      if (exp.id) {
        // Update existing expense
        await prisma.expense.update({
          where: { id: exp.id },
          data: {
            invoiceId: id,
            description: exp.description,
            amount: exp.amount,
            ...(exp.categoryId && { categoryId: exp.categoryId }),
          },
        });
      } else {
        // Create new expense linked to this invoice
        const count = await prisma.expense.count({ where: { companyId: company?.id } });
        const expenseNo = `EXP-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, "0")}`;

        await prisma.expense.create({
          data: {
            companyId: company?.id ?? invoice.companyId,
            expenseNo,
            invoiceId: id,
            categoryId: exp.categoryId || null,
            description: exp.description,
            amount: exp.amount,
            status: "APPROVED",
            date: new Date(),
            notes: `مصروف مباشر متعلق بالفاتورة ${invoice.invoiceNo}`,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "تم حفظ وتحديث تكاليف ومصاريف الفاتورة بنجاح",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "فشل حفظ تكاليف الفاتورة: " + (error?.message || "") },
      { status: 500 }
    );
  }
}
