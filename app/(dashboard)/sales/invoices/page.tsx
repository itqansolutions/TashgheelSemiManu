"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, RefreshCw, X, Loader2, CheckCircle,
  ChevronLeft, ChevronRight, FileText, DollarSign, Edit2,
  Clock, CheckCircle2, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

type InvoiceStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "CLOSED";

interface Invoice {
  id: string;
  invoiceNo: string;
  status: InvoiceStatus;
  total: number;
  subtotal: number;
  taxAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate?: string | null;
  notes?: string | null;
  createdAt: string;
  customer?: { id: string; name: string } | null;
}

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: "مسودة",
  PENDING: "بانتظار الاعتماد",
  APPROVED: "معتمدة",
  REJECTED: "مرفوضة",
  CANCELLED: "ملغاة",
  CLOSED: "مغلقة",
};

const STATUS_COLORS: Record<InvoiceStatus, { text: string; bg: string }> = {
  DRAFT:     { text: "#64748b", bg: "#64748b18" },
  PENDING:   { text: "#f59e0b", bg: "#f59e0b18" },
  APPROVED:  { text: "#10b981", bg: "#10b98118" },
  REJECTED:  { text: "#ef4444", bg: "#ef444418" },
  CANCELLED: { text: "#94a3b8", bg: "#94a3b818" },
  CLOSED:    { text: "#0284c7", bg: "#0284c718" },
};

function InvoiceModal({
  onClose,
  onSave,
  initial,
}: {
  onClose: () => void;
  onSave: (inv: Invoice) => void;
  initial?: Invoice | null;
}) {
  const [form, setForm] = useState({
    customerName: initial?.customer?.name ?? "",
    subject: "",
    totalAmount: initial?.subtotal?.toString() ?? "",
    taxPercent: "0",
    notes: initial?.notes ?? "",
    status: initial?.status ?? "DRAFT",
  });
  const [loading, setLoading] = useState(false);

  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [fetchingCustomers, setFetchingCustomers] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await fetch("/api/customers");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCustomers(data.data);
          if (!initial && data.data.length > 0 && !form.customerName) {
            setForm((prev) => ({ ...prev, customerName: data.data[0].name }));
          }
        }
      } catch {
        // silent
      } finally {
        setFetchingCustomers(false);
      }
    }
    loadCustomers();
  }, [initial, form.customerName]);

  const netTotal =
    parseFloat(form.totalAmount || "0") *
    (1 + parseFloat(form.taxPercent || "0") / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.subject.trim()) {
      return toast.error("اسم العميل وموضوع الفاتورة مطلوبان");
    }

    setLoading(true);
    try {
      const url = initial ? `/api/sales/invoices/${initial.id}` : "/api/sales/invoices";
      const method = initial ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          subject: form.subject,
          totalAmount: parseFloat(form.totalAmount || "0"),
          taxPercent: parseFloat(form.taxPercent || "0"),
          notes: form.notes,
          ...(initial && { status: form.status }),
        }),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "حدث خطأ");

      toast.success(initial ? "تم تحديث الفاتورة" : "تم إنشاء الفاتورة بنجاح");
      onSave(data.data);
    } catch {
      toast.error("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            {initial ? "تعديل الفاتورة" : "إنشاء فاتورة مبيعات جديدة"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold mb-1 block">اختر العميل *</label>
            {fetchingCustomers ? (
              <div className="h-10 px-3 rounded-lg border border-border bg-background flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 size={14} className="animate-spin" />
                جاري تحميل العملاء...
              </div>
            ) : customers.length > 0 ? (
              <select
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">-- اختر عميلاً من القائمة --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                placeholder="أدخل اسم العميل..."
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            )}
          </div>

          <div>
            <label className="text-xs font-bold mb-1 block">موضوع / وصف الفاتورة *</label>
            <input
              type="text"
              required
              placeholder="تصنيع وتركيب هياكل حديدية"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold mb-1 block">المبلغ قبل الضريبة (ج.م) *</label>
              <input
                type="number"
                required
                placeholder="25000"
                value={form.totalAmount}
                onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold mb-1 block">نسبة الضريبة %</label>
              <input
                type="number"
                placeholder="14"
                min="0"
                max="100"
                value={form.taxPercent}
                onChange={(e) => setForm({ ...form, taxPercent: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Net Total Preview */}
          {parseFloat(form.totalAmount || "0") > 0 && (
            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-sm">
              <span className="text-muted-foreground">إجمالي الفاتورة شامل الضريبة: </span>
              <span className="font-extrabold text-primary">
                {netTotal.toLocaleString("ar-EG", { maximumFractionDigits: 2 })} ج.م
              </span>
            </div>
          )}

          {initial && (
            <div>
              <label className="text-xs font-bold mb-1 block">حالة الفاتورة</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as InvoiceStatus })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-bold mb-1 block">ملاحظات</label>
            <textarea
              rows={2}
              placeholder="شروط الدفع، ملاحظات التسليم..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full p-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 bg-primary text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {initial ? "حفظ التعديلات" : "إنشاء الفاتورة"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 h-11 border border-border text-sm font-semibold rounded-xl"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sales/invoices");
      const data = await res.json();
      if (data.success) setInvoices(data.data ?? []);
    } catch {
      toast.error("فشل تحميل الفواتير");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("new") === "true") {
        setEditingInvoice(null);
        setShowModal(true);
      }
    }
  }, [fetchInvoices]);

  const filtered = invoices.filter((inv) => {
    const matchSearch =
      inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      (inv.customer?.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleSave = (inv: Invoice) => {
    setInvoices((prev) => {
      const idx = prev.findIndex((x) => x.id === inv.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = inv;
        return updated;
      }
      return [inv, ...prev];
    });
    setShowModal(false);
    setEditingInvoice(null);
  };

  const totalValue = invoices.reduce((s, inv) => s + Number(inv.total || 0), 0);
  const totalCollected = invoices.reduce((s, inv) => s + Number(inv.paidAmount || 0), 0);
  const totalRemaining = totalValue - totalCollected;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">فواتير المبيعات</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            إصدار وتتبع فواتير المبيعات وتحصيل المدفوعات
          </p>
        </div>
        <button
          onClick={() => { setEditingInvoice(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm active:scale-95 transition-transform shadow-md shadow-primary/20"
        >
          <Plus size={18} />
          <span>فاتورة جديدة</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الفواتير", value: invoices.length.toString(), icon: FileText, color: "#7c3aed" },
          { label: "إجمالي المبيعات", value: `${totalValue.toLocaleString("ar-EG", { maximumFractionDigits: 0 })} ج.م`, icon: DollarSign, color: "#0284c7" },
          { label: "المحصّل", value: `${totalCollected.toLocaleString("ar-EG", { maximumFractionDigits: 0 })} ج.م`, icon: CheckCircle2, color: "#10b981" },
          { label: "المتبقي للتحصيل", value: `${totalRemaining.toLocaleString("ar-EG", { maximumFractionDigits: 0 })} ج.م`, icon: Clock, color: "#f59e0b" },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
              <div style={{ background: `${card.color}18`, color: card.color }} className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-semibold truncate">{card.label}</p>
                <p className="text-base font-black leading-tight">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border">
          <div className="relative flex-1">
            <Search size={16} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث برقم الفاتورة أو اسم العميل..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-9 pr-9 pl-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
          >
            <option value="ALL">كل الحالات</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <button onClick={fetchInvoices} className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border text-sm font-semibold hover:bg-muted">
            <RefreshCw size={14} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <FileText size={28} />
            </div>
            <h3 className="font-bold text-base mb-1">لا توجد فواتير</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              {search || statusFilter !== "ALL" ? "لا توجد نتائج لمعايير البحث" : "أنشئ أول فاتورة مبيعات الآن"}
            </p>
            {!search && statusFilter === "ALL" && (
              <button
                onClick={() => { setEditingInvoice(null); setShowModal(true); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
              >
                <Plus size={16} />
                إنشاء فاتورة
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">رقم الفاتورة</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">العميل</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">الإجمالي</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs hidden md:table-cell">المحصّل</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs hidden md:table-cell">المتبقي</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">الحالة</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs hidden sm:table-cell">التاريخ</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((inv) => {
                    const sc = STATUS_COLORS[inv.status] ?? { text: "#64748b", bg: "#64748b18" };
                    const isOverdue =
                      inv.dueDate &&
                      new Date(inv.dueDate) < new Date() &&
                      Number(inv.remainingAmount) > 0;
                    return (
                      <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-primary text-xs">
                          {inv.invoiceNo}
                          {isOverdue && (
                            <span className="mr-1 text-destructive" title="متأخرة السداد">⚠</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {inv.customer?.name?.[0] ?? "?"}
                            </div>
                            <span className="font-semibold text-xs">{inv.customer?.name ?? "—"}</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-extrabold">
                          {Number(inv.total).toLocaleString("ar-EG", { maximumFractionDigits: 0 })} ج.م
                        </td>
                        <td className="p-3.5 hidden md:table-cell text-emerald-500 font-bold">
                          {Number(inv.paidAmount).toLocaleString("ar-EG", { maximumFractionDigits: 0 })} ج.م
                        </td>
                        <td className="p-3.5 hidden md:table-cell font-bold" style={{ color: Number(inv.remainingAmount) > 0 ? "#f59e0b" : "#10b981" }}>
                          {Number(inv.remainingAmount).toLocaleString("ar-EG", { maximumFractionDigits: 0 })} ج.م
                        </td>
                        <td className="p-3.5">
                          <span
                            style={{ color: sc.text, background: sc.bg }}
                            className="px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                          >
                            {STATUS_LABELS[inv.status]}
                          </span>
                        </td>
                        <td className="p-3.5 hidden sm:table-cell text-muted-foreground text-xs">
                          {new Date(inv.createdAt).toLocaleDateString("ar-EG")}
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => { setEditingInvoice(inv); setShowModal(true); }}
                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border text-sm">
                <span className="text-muted-foreground text-xs">
                  عرض {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} من {filtered.length}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-border disabled:opacity-40">
                    <ChevronRight size={16} />
                  </button>
                  <span className="px-3 font-bold">{page}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-border disabled:opacity-40">
                    <ChevronLeft size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <InvoiceModal
          onClose={() => { setShowModal(false); setEditingInvoice(null); }}
          onSave={handleSave}
          initial={editingInvoice}
        />
      )}
    </div>
  );
}
