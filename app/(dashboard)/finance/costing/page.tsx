"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calculator, DollarSign, Package, Wrench, Plus, Trash2,
  TrendingUp, Percent, Printer, RefreshCw, FileText, CheckCircle2,
  Sliders, ArrowUpRight, Search, ChevronRight, Layers, PieChart,
  Loader2, AlertCircle, ShoppingCart, Tag, Check, Filter,
} from "lucide-react";
import { toast } from "sonner";
import PrintPortal from "@/components/global/PrintPortal";

interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  total: number;
  customer?: { id: string; name: string } | null;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    cost?: number;
  }>;
}

interface ItemCostRow {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalSale: number;
  unitCost: number;
}

interface LinkedExpenseRow {
  id?: string;
  categoryId?: string;
  description: string;
  amount: number;
}

interface ExpenseCategoryOption {
  id: string;
  name: string;
}

export default function CostingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategoryOption[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "COSTED">("ALL");

  // Selected Invoice State
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [saving, setSaving] = useState(false);

  // Selected Invoice Costing Data
  const [invoiceHeader, setInvoiceHeader] = useState<{
    id: string;
    invoiceNo: string;
    customerName: string;
    date: string;
    totalSales: number;
  } | null>(null);

  const [itemCosts, setItemCosts] = useState<ItemCostRow[]>([]);
  const [linkedExpenses, setLinkedExpenses] = useState<LinkedExpenseRow[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // 1. Fetch Invoices list & Expense Categories
  const fetchInvoicesList = useCallback(async () => {
    setLoadingInvoices(true);
    try {
      const [resInv, resExpCat] = await Promise.all([
        fetch("/api/sales/invoices"),
        fetch("/api/expenses"),
      ]);
      const dataInv = await resInv.json();
      if (dataInv.success) setInvoices(dataInv.data ?? []);
    } catch {
      toast.error("فشل تحميل قائمة الفواتير");
    } finally {
      setLoadingInvoices(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoicesList();
  }, [fetchInvoicesList]);

  // 2. Load Selected Invoice Costing Details
  const loadInvoiceCosting = useCallback(async (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/sales/invoices/${invoiceId}/costing`);
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setInvoiceHeader({
          id: d.invoice.id,
          invoiceNo: d.invoice.invoiceNo,
          customerName: d.invoice.customerName,
          date: d.invoice.date,
          totalSales: d.invoice.totalSales,
        });

        setItemCosts(
          d.items.map((i: any) => ({
            id: i.id,
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            totalSale: i.total,
            unitCost: i.unitCost || 0,
          }))
        );

        setLinkedExpenses(
          d.linkedExpenses.map((e: any) => ({
            id: e.id,
            categoryId: e.categoryId,
            description: e.description,
            amount: e.amount,
          }))
        );
      } else {
        toast.error(json.message || "تعذر جلب تفاصيل الفاتورة");
      }
    } catch {
      toast.error("فشل الاتصال بالخادم");
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  // Handlers for Item Cost inputs
  const updateItemUnitCost = (id: string, cost: number) => {
    setItemCosts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unitCost: cost } : item))
    );
  };

  // Handlers for Linked Expenses
  const addExpenseRow = () => {
    setLinkedExpenses((prev) => [
      ...prev,
      { description: "مصروف جديد للفاتورة (نقل/مصنوعية/دهان)", amount: 0 },
    ]);
  };

  const removeExpenseRow = (index: number) => {
    setLinkedExpenses((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateExpenseRow = (index: number, field: keyof LinkedExpenseRow, value: any) => {
    setLinkedExpenses((prev) =>
      prev.map((e, idx) => (idx === index ? { ...e, [field]: value } : e))
    );
  };

  // Cost Calculations for Selected Invoice
  const totalSales = invoiceHeader?.totalSales ?? 0;
  const totalDirectItemsCost = itemCosts.reduce(
    (sum, item) => sum + item.unitCost * item.quantity,
    0
  );
  const totalLinkedExpensesAmount = linkedExpenses.reduce(
    (sum, exp) => sum + (Number(exp.amount) || 0),
    0
  );
  const totalInvoiceCost = totalDirectItemsCost + totalLinkedExpensesAmount;
  const netInvoiceProfit = totalSales - totalInvoiceCost;
  const profitMarginPct = totalSales > 0 ? (netInvoiceProfit / totalSales) * 100 : 0;

  // Save Costing
  const handleSaveCosting = async () => {
    if (!selectedInvoiceId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/sales/invoices/${selectedInvoiceId}/costing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemCosts: itemCosts.map((i) => ({ id: i.id, cost: i.unitCost })),
          expenses: linkedExpenses.map((e) => ({
            id: e.id,
            categoryId: e.categoryId,
            description: e.description,
            amount: e.amount,
          })),
        }),
      });

      const json = await res.json();
      if (!res.ok) return toast.error(json.message || "حدث خطأ أثناء الحفظ");

      toast.success("تم حفظ تكاليف ومصاريف الفاتورة بنجاح وتحديث التقارير");
      fetchInvoicesList();
    } catch {
      toast.error("تعذر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  // Filtered Invoices List
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      (inv.customer?.name ?? "").toLowerCase().includes(search.toLowerCase());

    const isCosted = inv.items.some((i) => Number(i.cost || 0) > 0);

    if (statusFilter === "PENDING") return matchesSearch && !isCosted;
    if (statusFilter === "COSTED") return matchesSearch && isCosted;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Calculator size={26} className="text-primary" />
            تومان وتكليف فواتير المبيعات
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            تحديد تكلفة الخامات والمصنوعية والمصاريف المتعلقة بكل فاتورة لربحية دقيقة بالتقارير
          </p>
        </div>
      </div>

      {/* Grid Layout: Invoices Selector (Right 1 col) & Costing Editor (Left 2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Right 4 Cols: Invoices List Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black flex items-center gap-2">
                <FileText size={16} className="text-primary" /> اختر الفاتورة للتكليف
              </h2>
              <button
                onClick={fetchInvoicesList}
                className="p-1 text-muted-foreground hover:text-foreground"
                title="تحديث القائمة"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Search & Status Filters */}
            <div className="relative">
              <Search size={15} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="ابحث برقم الفاتورة أو العميل..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pr-9 pl-3 rounded-lg border border-border bg-background text-xs focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl text-[11px] font-bold">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`flex-1 py-1 rounded-lg transition-colors ${
                  statusFilter === "ALL" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                }`}
              >
                الكل ({invoices.length})
              </button>
              <button
                onClick={() => setStatusFilter("PENDING")}
                className={`flex-1 py-1 rounded-lg transition-colors ${
                  statusFilter === "PENDING" ? "bg-amber-500/10 text-amber-700 font-black" : "text-muted-foreground"
                }`}
              >
                بانتظارالتكليف
              </button>
              <button
                onClick={() => setStatusFilter("COSTED")}
                className={`flex-1 py-1 rounded-lg transition-colors ${
                  statusFilter === "COSTED" ? "bg-emerald-500/10 text-emerald-700 font-black" : "text-muted-foreground"
                }`}
              >
                مكلفة
              </button>
            </div>

            {/* Invoices List */}
            {loadingInvoices ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-primary" />
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-xs">
                لا توجد فواتير مبيعات ملاحقة
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredInvoices.map((inv) => {
                  const isSelected = selectedInvoiceId === inv.id;
                  const isCosted = inv.items.some((i) => Number(i.cost || 0) > 0);

                  return (
                    <div
                      key={inv.id}
                      onClick={() => loadInvoiceCosting(inv.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:bg-muted/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-black text-xs text-primary">{inv.invoiceNo}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCosted ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                          }`}
                        >
                          {isCosted ? "مُكلفة" : "بانتظار التكليف"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold">{inv.customer?.name ?? "عميل عام"}</span>
                        <span className="font-black text-foreground">
                          {Number(inv.total).toLocaleString("ar-EG")} ج.م
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Left 8 Cols: Selected Invoice Costing Panel */}
        <div className="lg:col-span-8 space-y-6">
          {!selectedInvoiceId ? (
            <div className="bg-card border border-border rounded-2xl p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Calculator size={32} />
              </div>
              <h3 className="font-black text-lg mb-1">حدد فاتورة من القائمة للبدء بتكليفها</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                اختر الفاتورة المطلوبة لتكليف كل صنف بها وربط المصاريف التشغيلية بها لعرض أرباحها الصافية.
              </p>
            </div>
          ) : loadingDetails ? (
            <div className="bg-card border border-border rounded-2xl p-20 flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-primary ml-3" />
              <span className="font-bold text-sm">جارٍ تحميل بنود ومصاريف الفاتورة...</span>
            </div>
          ) : invoiceHeader && (
            <div className="space-y-6">
              
              {/* Selected Invoice Banner */}
              <div className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-primary text-white text-xs font-black rounded-lg">
                      الفاتورة: {invoiceHeader.invoiceNo}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      تاريخ الفاتورة: {new Date(invoiceHeader.date).toLocaleDateString("ar-EG")}
                    </span>
                  </div>
                  <h2 className="text-xl font-black mt-1">العميل: {invoiceHeader.customerName}</h2>
                </div>

                <div className="text-left sm:text-right bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl">
                  <span className="text-xs text-muted-foreground font-bold block">قيمة الفاتورة (المبيعات):</span>
                  <span className="text-2xl font-black text-primary">
                    {totalSales.toLocaleString("ar-EG")} ج.م
                  </span>
                </div>
              </div>

              {/* Section 1: Item-by-Item Costing Table */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-base font-black flex items-center gap-2 text-amber-600">
                    <Package size={18} /> 1. تكليف خامات وبنود الفاتورة بنداً بنداً
                  </h3>
                  <span className="text-xs font-bold text-muted-foreground">
                    عدد البنود: {itemCosts.length}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border text-muted-foreground font-bold">
                        <th className="p-3">وصف الصنف / الخامة</th>
                        <th className="p-3 text-center">الكمية</th>
                        <th className="p-3 text-center">سعر البيع الفردي</th>
                        <th className="p-3 text-center">إجمالي البيع</th>
                        <th className="p-3 text-center bg-amber-500/10 text-amber-800">تكلفة الخامة الفردية *</th>
                        <th className="p-3 text-center">إجمالي تكلفة البند</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {itemCosts.map((item) => {
                        const totalItemCost = item.unitCost * item.quantity;
                        return (
                          <tr key={item.id} className="hover:bg-muted/10">
                            <td className="p-3 font-bold">{item.description}</td>
                            <td className="p-3 text-center font-semibold">{item.quantity}</td>
                            <td className="p-3 text-center">{item.unitPrice.toLocaleString("ar-EG")} ج.م</td>
                            <td className="p-3 text-center font-bold text-foreground">
                              {item.totalSale.toLocaleString("ar-EG")} ج.م
                            </td>
                            <td className="p-3 bg-amber-500/5">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0"
                                value={item.unitCost || ""}
                                onChange={(e) =>
                                  updateItemUnitCost(item.id, parseFloat(e.target.value || "0"))
                                }
                                className="w-28 h-9 px-2 text-xs font-black text-center rounded-lg border border-amber-500/30 bg-background focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                              />
                            </td>
                            <td className="p-3 text-center font-black text-amber-700">
                              {totalItemCost.toLocaleString("ar-EG")} ج.م
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end border-t border-border pt-3">
                  <span className="text-xs font-black text-amber-700">
                    إجمالي تكلفة بنود الفاتورة المباشرة: {totalDirectItemsCost.toLocaleString("ar-EG")} ج.م
                  </span>
                </div>
              </div>

              {/* Section 2: Linked Expenses for this Invoice */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-base font-black flex items-center gap-2 text-purple-600">
                    <Wrench size={18} /> 2. المصاريف والتشغيل المتعلق بهذه الفاتورة
                  </h3>
                  <button
                    type="button"
                    onClick={addExpenseRow}
                    className="px-3 py-1.5 bg-purple-500/10 text-purple-700 hover:bg-purple-500/20 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Plus size={14} /> إضافة مصروف متعلق بالفاتورة
                  </button>
                </div>

                <div className="space-y-3">
                  {linkedExpenses.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-xs">
                      لا توجد مصاريف مخصصة لهذه الفاتورة بعد (اضغط إضافة مصروف لإدخال نقل أو مصنوعية)
                    </div>
                  ) : (
                    linkedExpenses.map((exp, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-3 items-center bg-muted/20 p-3 rounded-xl border border-border"
                      >
                        <div className="col-span-7">
                          <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">بيان ووصف المصروف</label>
                          <input
                            type="text"
                            placeholder="مثال: مصنوعية دهان ورشة خارجية / نقل وتركيب موقع..."
                            value={exp.description}
                            onChange={(e) => updateExpenseRow(idx, "description", e.target.value)}
                            className="w-full h-9 px-3 text-xs font-bold rounded-lg border border-border bg-background focus:outline-none"
                          />
                        </div>

                        <div className="col-span-4">
                          <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">قيمة المصروف (ج.م)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0"
                            value={exp.amount || ""}
                            onChange={(e) =>
                              updateExpenseRow(idx, "amount", parseFloat(e.target.value || "0"))
                            }
                            className="w-full h-9 px-3 text-xs font-bold text-center rounded-lg border border-border bg-background focus:outline-none"
                          />
                        </div>

                        <div className="col-span-1 flex items-center justify-end pt-4">
                          <button
                            type="button"
                            onClick={() => removeExpenseRow(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex justify-end border-t border-border pt-3">
                  <span className="text-xs font-black text-purple-700">
                    إجمالي المصاريف المتعلقة بالفاتورة: {totalLinkedExpensesAmount.toLocaleString("ar-EG")} ج.م
                  </span>
                </div>
              </div>

              {/* Section 3: Final Invoice Profitability Summary Card & Save */}
              <div className="bg-card border-2 border-primary/30 rounded-2xl p-6 space-y-5 shadow-lg">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-lg font-black text-primary flex items-center gap-2">
                    <PieChart size={20} /> ملخص أرباح وتكاليف الفاتورة {invoiceHeader.invoiceNo}
                  </h3>
                  <button
                    onClick={() => setShowPrintModal(true)}
                    className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-lg flex items-center gap-1"
                  >
                    <Printer size={14} /> معاينة A4
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                    <span className="text-muted-foreground block text-[11px]">المبيعات (الفاتورة)</span>
                    <p className="text-lg font-black text-foreground">{totalSales.toLocaleString("ar-EG")} ج.م</p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                    <span className="text-amber-700 block text-[11px]">التكلفة المباشرة للبنود</span>
                    <p className="text-lg font-black text-amber-700">{totalDirectItemsCost.toLocaleString("ar-EG")} ج.م</p>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                    <span className="text-purple-700 block text-[11px]">المصاريف المتعلقة</span>
                    <p className="text-lg font-black text-purple-700">{totalLinkedExpensesAmount.toLocaleString("ar-EG")} ج.م</p>
                  </div>

                  <div className={`p-3 rounded-xl border space-y-1 ${netInvoiceProfit >= 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"}`}>
                    <span className={`block text-[11px] ${netInvoiceProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>صافي الربح الصافي</span>
                    <p className={`text-lg font-black ${netInvoiceProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                      {netInvoiceProfit.toLocaleString("ar-EG")} ج.م
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground">
                    نسبة صافي الربح: <span className="font-extrabold text-foreground">{profitMarginPct.toFixed(1)}%</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleSaveCosting}
                    disabled={saving}
                    className="px-6 h-11 bg-primary text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg active:scale-95 transition-transform"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    حفظ وتكليف الفاتورة والتثبيت بالتقارير
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Printable Cost Sheet Portal */}
      {showPrintModal && invoiceHeader && (
        <PrintPortal>
          <div className="printable-modal-overlay fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden">
            <div className="printable-modal-card bg-card w-full max-w-3xl rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden">
              <div className="bg-card border-b border-border px-4 py-3 shadow-sm flex items-center justify-between print:hidden">
                <h2 className="text-sm font-extrabold flex items-center gap-2">
                  <Printer size={18} className="text-primary" /> كارت دراسة وتكلفة الفاتورة {invoiceHeader.invoiceNo}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-primary text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Printer size={15} /> طباعة وحفظ كـ PDF
                  </button>
                  <button
                    onClick={() => setShowPrintModal(false)}
                    className="px-3.5 py-2 bg-muted text-foreground rounded-xl text-xs font-bold"
                  >
                    إغلاق
                  </button>
                </div>
              </div>

              <div className="printable-modal-body p-6 space-y-6">
                <div className="border-b pb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black text-primary">كارت تكلفة الفاتورة: {invoiceHeader.invoiceNo}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">العميل: {invoiceHeader.customerName}</p>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">{new Date(invoiceHeader.date).toLocaleDateString("ar-EG")}</span>
                </div>

                {/* Items Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-amber-700">تكلفة البنود المباشرة:</h4>
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-amber-500/10 text-amber-800 font-bold border-b border-border">
                        <th className="p-2">البند</th>
                        <th className="p-2">الكمية</th>
                        <th className="p-2">سعر البيع</th>
                        <th className="p-2">إجمالي البيع</th>
                        <th className="p-2">تكلفة الفردية</th>
                        <th className="p-2">إجمالي التكلفة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {itemCosts.map((i) => (
                        <tr key={i.id}>
                          <td className="p-2 font-bold">{i.description}</td>
                          <td className="p-2">{i.quantity}</td>
                          <td className="p-2">{i.unitPrice.toLocaleString("ar-EG")} ج.م</td>
                          <td className="p-2 font-bold">{i.totalSale.toLocaleString("ar-EG")} ج.م</td>
                          <td className="p-2">{i.unitCost.toLocaleString("ar-EG")} ج.م</td>
                          <td className="p-2 font-bold text-amber-700">{(i.unitCost * i.quantity).toLocaleString("ar-EG")} ج.م</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Linked Expenses */}
                {linkedExpenses.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-purple-700">المصاريف المتعلقة بالفاتورة:</h4>
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="bg-purple-500/10 text-purple-800 font-bold border-b border-border">
                          <th className="p-2">وصف المصروف</th>
                          <th className="p-2">القيمة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {linkedExpenses.map((e, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-bold">{e.description}</td>
                            <td className="p-2 font-bold text-purple-700">{Number(e.amount).toLocaleString("ar-EG")} ج.م</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Final Summary */}
                <div className="flex justify-end pt-2">
                  <div className="w-72 border rounded-xl p-3 space-y-1.5 text-xs text-right bg-muted/20">
                    <div className="flex justify-between"><span>المبيعات (الفاتورة):</span><span className="font-bold">{totalSales.toLocaleString("ar-EG")} ج.م</span></div>
                    <div className="flex justify-between"><span>تكلفة البنود:</span><span className="font-bold text-amber-700">{totalDirectItemsCost.toLocaleString("ar-EG")} ج.م</span></div>
                    <div className="flex justify-between"><span>المصاريف المتعلقة:</span><span className="font-bold text-purple-700">{totalLinkedExpensesAmount.toLocaleString("ar-EG")} ج.م</span></div>
                    <div className="flex justify-between pt-1 border-t font-black"><span>إجمالي التكلفة:</span><span>{totalInvoiceCost.toLocaleString("ar-EG")} ج.م</span></div>
                    <div className="flex justify-between pt-1 border-t font-black text-sm text-emerald-600"><span>صافي الربح الصافي:</span><span>{netInvoiceProfit.toLocaleString("ar-EG")} ج.م</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PrintPortal>
      )}
    </div>
  );
}
