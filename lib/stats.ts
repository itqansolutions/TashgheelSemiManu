import prisma from "@/lib/db";

export async function getDashboardStatsData() {
  const company = await prisma.company.findFirst();
  const companyId = company?.id;

  const [
    invoicesAggregate,
    customerPaymentsAggregate,
    purchaseInvoicesAggregate,
    supplierPaymentsAggregate,
    supplierOpeningsAggregate,
    customerOpeningsAggregate,
    activeJobOrders,
    itemsCount,
    customersCount,
    suppliersCount,
    quotationsCount,
    recentJobOrders,
  ] = await Promise.all([
    // Total Sales (excluding CANCELLED and REJECTED)
    prisma.customerInvoice.aggregate({
      where: {
        ...(companyId ? { companyId } : {}),
        deletedAt: null,
        status: { notIn: ["CANCELLED", "REJECTED"] },
      },
      _sum: { total: true, remainingAmount: true },
    }),

    // Total Customer Payments Collected
    prisma.customerPayment.aggregate({
      where: {
        ...(companyId ? { companyId } : {}),
        deletedAt: null,
        status: "APPROVED",
      },
      _sum: { amount: true },
    }),

    // Total Supplier Purchase Invoices
    prisma.purchaseInvoice.aggregate({
      where: {
        ...(companyId ? { companyId } : {}),
        deletedAt: null,
        status: { notIn: ["CANCELLED", "REJECTED"] },
      },
      _sum: { total: true, remainingAmount: true },
    }),

    // Total Supplier Payments Paid
    prisma.supplierPayment.aggregate({
      where: {
        ...(companyId ? { companyId } : {}),
        deletedAt: null,
        status: "APPROVED",
      },
      _sum: { amount: true },
    }),

    // Supplier Opening Balances
    prisma.supplier.aggregate({
      where: {
        ...(companyId ? { companyId } : {}),
        deletedAt: null,
      },
      _sum: { openingBalance: true },
    }),

    // Customer Opening Balances
    prisma.customer.aggregate({
      where: {
        ...(companyId ? { companyId } : {}),
        deletedAt: null,
      },
      _sum: { openingBalance: true },
    }),

    // Active Job Orders
    prisma.jobOrder.count({
      where: {
        ...(companyId ? { companyId } : {}),
        status: { in: ["IN_PRODUCTION", "IN_FINISHING", "INSTALLING", "PURCHASING", "APPROVED"] },
        deletedAt: null,
      },
    }),

    // Active Items
    prisma.item.count({
      where: {
        ...(companyId ? { companyId } : {}),
        isActive: true,
        deletedAt: null,
      },
    }),

    // Customers
    prisma.customer.count({
      where: {
        ...(companyId ? { companyId } : {}),
        deletedAt: null,
      },
    }),

    // Suppliers
    prisma.supplier.count({
      where: {
        ...(companyId ? { companyId } : {}),
        deletedAt: null,
      },
    }),

    // Quotations
    prisma.quotation.count({
      where: {
        ...(companyId ? { companyId } : {}),
        deletedAt: null,
      },
    }),

    // Recent Job Orders
    prisma.jobOrder.findMany({
      where: {
        ...(companyId ? { companyId } : {}),
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { customer: { select: { id: true, name: true } } },
    }),
  ]);

  const totalSales = Number(invoicesAggregate._sum.total ?? 0);
  const totalCollected = Number(customerPaymentsAggregate._sum.amount ?? 0);
  const totalSupplierPaid = Number(supplierPaymentsAggregate._sum.amount ?? 0);

  const totalCustomerInvoices = Number(invoicesAggregate._sum.total ?? 0);
  const customerOpeningSum = Number(customerOpeningsAggregate._sum.openingBalance ?? 0);
  const totalCustomersDebt = Math.max(0, (totalCustomerInvoices + customerOpeningSum) - totalCollected);

  const totalPurchaseInvoices = Number(purchaseInvoicesAggregate._sum.total ?? 0);
  const supplierOpeningSum = Number(supplierOpeningsAggregate._sum.openingBalance ?? 0);
  const totalSuppliersDebt = Math.max(0, (totalPurchaseInvoices + supplierOpeningSum) - totalSupplierPaid);

  return {
    totalSales,
    totalCollected,
    totalSupplierPaid,
    totalCustomersDebt,
    totalSuppliersDebt,
    activeJobOrders,
    itemsCount,
    customersCount,
    suppliersCount,
    quotationsCount,
    recentJobOrders: recentJobOrders.map((jo) => ({
      id: jo.id,
      jobNo: jo.jobNo,
      title: jo.title,
      status: jo.status,
      createdAt: jo.createdAt.toISOString(),
      customer: jo.customer ? { name: jo.customer.name } : null,
    })),
  };
}
