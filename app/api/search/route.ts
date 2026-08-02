// ============================================================
// Tashgheel — Global Search API
// GET /api/search?q=query&companyId=xxx
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const companyId = searchParams.get("companyId") ?? "";

  if (!q || q.length < 2 || !companyId) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const results: Array<{
      id: string;
      entityType: string;
      title: string;
      subtitle?: string;
      route: string;
    }> = [];

    // Search Customers
    const customers = await prisma.customer.findMany({
      where: {
        companyId,
        deletedAt: null,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
          { email: { contains: q, mode: "insensitive" } },
          { code: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: { id: true, name: true, phone: true },
    });

    results.push(
      ...customers.map((c) => ({
        id: c.id,
        entityType: "customer",
        title: c.name,
        subtitle: c.phone ?? undefined,
        route: `/customers/${c.id}`,
      }))
    );

    // Search Invoices
    const invoices = await prisma.customerInvoice.findMany({
      where: {
        companyId,
        deletedAt: null,
        OR: [
          { invoiceNo: { contains: q, mode: "insensitive" } },
          { customer: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      take: 5,
      select: {
        id: true,
        invoiceNo: true,
        total: true,
        customer: { select: { name: true } },
      },
    });

    results.push(
      ...invoices.map((inv) => ({
        id: inv.id,
        entityType: "invoice",
        title: inv.invoiceNo,
        subtitle: `${inv.customer.name} — ${Number(inv.total).toLocaleString("ar-EG")} ج.م`,
        route: `/sales/invoices/${inv.id}`,
      }))
    );

    // Search Job Orders
    const jobOrders = await prisma.jobOrder.findMany({
      where: {
        companyId,
        deletedAt: null,
        OR: [
          { jobNo: { contains: q, mode: "insensitive" } },
          { title: { contains: q, mode: "insensitive" } },
          { customer: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      take: 5,
      select: {
        id: true,
        jobNo: true,
        title: true,
        customer: { select: { name: true } },
      },
    });

    results.push(
      ...jobOrders.map((jo) => ({
        id: jo.id,
        entityType: "job_order",
        title: `${jo.jobNo} — ${jo.title}`,
        subtitle: jo.customer.name,
        route: `/workshop/job-orders/${jo.id}`,
      }))
    );

    // Search Suppliers
    const suppliers = await prisma.supplier.findMany({
      where: {
        companyId,
        deletedAt: null,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
        ],
      },
      take: 3,
      select: { id: true, name: true, phone: true },
    });

    results.push(
      ...suppliers.map((s) => ({
        id: s.id,
        entityType: "supplier",
        title: s.name,
        subtitle: s.phone ?? undefined,
        route: `/suppliers/${s.id}`,
      }))
    );

    // Search Quotations
    const quotations = await prisma.quotation.findMany({
      where: {
        companyId,
        deletedAt: null,
        OR: [
          { quotationNo: { contains: q, mode: "insensitive" } },
          { customer: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      take: 3,
      select: {
        id: true,
        quotationNo: true,
        customer: { select: { name: true } },
      },
    });

    results.push(
      ...quotations.map((quo) => ({
        id: quo.id,
        entityType: "quotation",
        title: quo.quotationNo,
        subtitle: quo.customer.name,
        route: `/sales/quotations/${quo.id}`,
      }))
    );

    return NextResponse.json({ success: true, data: results.slice(0, 15) });
  } catch (error) {
    console.error("[Search API]", error);
    return NextResponse.json(
      { success: false, message: "خطأ في البحث", data: [] },
      { status: 500 }
    );
  }
}
