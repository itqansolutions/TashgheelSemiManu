"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, RefreshCw, X, Loader2, CheckCircle,
  ChevronLeft, ChevronRight, FileText, DollarSign, Edit2,
  Send, Clock, XCircle, CheckCircle2, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

type QuoteStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "CLOSED";

interface Quotation {
  id: string;
  quotationNo: string;
  status: QuoteStatus;
  total: number;
  subtotal: number;
  validUntil?: string | null;
  notes?: string | null;
  createdAt: string;
  customer?: { id: string; name: string } | null;
}

const STATUS_LABELS: Record<QuoteStatus, string> = {
  DRAFT: "مسودة",
  PENDING: "بانتظار الاعتماد",
  APPROVED: "معتمد",
  REJECTED: "مرفوض",
  CANCELLED: "ملغى",
  CLOSED: "مغلق",
};

const STATUS_COLORS: Record<QuoteStatus, { text: string; bg: string }> = {
  DRAFT:     { text: "#64748b", bg: "#64748b18" },
  PENDING:   { text: "#f59e0b", bg: "#f59e0b18" },
  APPROVED:  { text: "#10b981", bg: "#10b98118" },
  REJECTED:  { text: "#ef4444", bg: "#ef444418" },
  CANCELLED: { text: "#94a3b8", bg: "#94a3b818" },
  CLOSED:    { text: "#0284c7", bg: "#0284c718" },
};

function QuotationModal({
  onClose,
  onSave,
  initial,
}: {
  onClose: () => void;
  onSave: (q: Quotation) => void;
  initial?: Quotation | null;
}) {
  const [form, setForm] = useState({
    customerName: initial?.customer?.name ?? "",
    subject: "",
    totalAmount: initial?.total?.toString() ?? "",
    notes: initial?.notes ?? "",
    validDays: "30",
    status: initial?.status ?? "DRAFT",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.subject.trim()) {
      return toast.error("اسم العميل وموضوع العرض مطلوبان");
    }

    setLoading(true);
    try {
      const url = initial ? `/api/sales/quotations/${initial.id}` : "/api/sales/quotations";
      const method = initial ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          subject: form.subject,
          totalAmount: parseFloat(form.totalAmount || "0"),
          notes: form.notes,
          validDays: parseInt(form.validDays || "30"),
          ...(initial && { status: form.status }),
        }),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "حدث خطأ");

      toast.success(initial ? "تم تحديث عرض السعر" : "تم إنشاء عرض السعر بنجاح");
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
            {initial ? "تعديل عرض السعر" : "إنشاء عرض سعر جديد"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold mb-1 block">اسم العميل *</label>
            <input
              type="text"
              required
              placeholder="شركة الأمل للمقاولات"
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-xs font-bold mb-1 block">موضوع / وصف عرض السعر *</label>
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
              <label className="text-xs font-bold mb-1 block">الإجمالي (ج.م) *</label>
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
              <label className="text-xs font-bold mb-1 block">صلاحية العرض (أيام)</label>
              <input
                type="number"
                placeholder="30"
                value={form.validDays}
                onChange={(e) => setForm({ ...form, validDays: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
              />
            </div>
          </div>

          {initial && (
            <div>
              <label className="text-xs font-bold mb-1 block">حالة العرض</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as QuoteStatus })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-bold mb-1 block">ملاحظات وشروط</label>
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
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {initial ? "حفظ التعديلات" : "إنشاء عرض السعر"}
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

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sales/quotations");
      const data = await res.json();
      if (data.success) setQuotations(data.data ?? []);
    } catch {
      toast.error("فشل تحميل عروض الأسعار");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotations();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("new") === "true") {
        setEditingQuotation(null);
        setShowModal(true);
      }
    }
  }, [fetchQuotations]);

  const filtered = quotations.filter((q) => {
    const matchSearch =
      q.quotationNo.toLowerCase().includes(search.toLowerCase()) ||
      (q.customer?.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleSave = (q: Quotation) => {
    setQuotations((prev) => {
      const idx = prev.findIndex((x) => x.id === q.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = q;
        return updated;
      }
      return [q, ...prev];
    });
    setShowModal(false);
    setEditingQuotation(null);
  };

  const totalValue = quotations.reduce((s, q) => s + (Number(q.total) || 0), 0);
  const approvedCount = quotations.filter((q) => q.status === "APPROVED").length;
  const pendingCount = quotations.filter((q) => q.status === "PENDING" || q.status === "DRAFT").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">عروض الأسعار</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            إنشاء وإرسال وتتبع عروض الأسعار للعملاء
          </p>
        </div>
        <button
          onClick={() => { setEditingQuotation(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm active:scale-95 transition-transform shadow-md shadow-primary/20"
        >
          <Plus size={18} />
          <span>عرض سعر جديد</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "إجمالي العروض", value: quotations.length.toString(), icon: FileText, color: "#7c3aed" },
          { label: "معتمدة", value: approvedCount.toString(), icon: CheckCircle2, color: "#10b981" },
          { label: "قيد الانتظار", value: pendingCount.toString(), icon: Clock, color: "#f59e0b" },
          { label: "إجمالي القيمة", value: `${totalValue.toLocaleString("ar-EG", { maximumFractionDigits: 0 })} ج.م`, icon: DollarSign, color: "#0284c7" },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
              <div style={{ background: `${card.color}18`, color: card.color }} className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-semibold truncate">{card.label}</p>
                <p className="text-lg font-black leading-tight">{card.value}</p>
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
              placeholder="ابحث برقم العرض أو اسم العميل..."
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
          <button onClick={fetchQuotations} className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border text-sm font-semibold hover:bg-muted">
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
            <h3 className="font-bold text-base mb-1">لا توجد عروض أسعار</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              {search || statusFilter !== "ALL" ? "لا توجد نتائج لمعايير البحث" : "أنشئ أول عرض سعر وأرسله للعميل"}
            </p>
            {!search && statusFilter === "ALL" && (
              <button
                onClick={() => { setEditingQuotation(null); setShowModal(true); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
              >
                <Plus size={16} />
                إنشاء عرض سعر
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">رقم العرض</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">العميل</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">الإجمالي</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">الحالة</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs hidden md:table-cell">الصلاحية</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs hidden sm:table-cell">التاريخ</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((q) => {
                    const sc = STATUS_COLORS[q.status] ?? { text: "#64748b", bg: "#64748b18" };
                    const isExpired =
                      q.validUntil && new Date(q.validUntil) < new Date() && q.status === "DRAFT";
                    return (
                      <tr key={q.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-primary text-xs">
                          {q.quotationNo}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {q.customer?.name?.[0] ?? "?"}
                            </div>
                            <span className="font-semibold text-xs">{q.customer?.name ?? "—"}</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-extrabold">
                          {Number(q.total).toLocaleString("ar-EG")} ج.م
                        </td>
                        <td className="p-3.5">
                          <span
                            style={{ color: sc.text, background: sc.bg }}
                            className="px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                          >
                            {STATUS_LABELS[q.status]}
                          </span>
                        </td>
                        <td className="p-3.5 hidden md:table-cell text-xs">
                          {q.validUntil ? (
                            <span className={isExpired ? "text-destructive font-semibold" : "text-muted-foreground"}>
                              {isExpired && "⚠ منتهي — "}
                              {new Date(q.validUntil).toLocaleDateString("ar-EG")}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="p-3.5 hidden sm:table-cell text-muted-foreground text-xs">
                          {new Date(q.createdAt).toLocaleDateString("ar-EG")}
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => { setEditingQuotation(q); setShowModal(true); }}
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
        <QuotationModal
          onClose={() => { setShowModal(false); setEditingQuotation(null); }}
          onSave={handleSave}
          initial={editingQuotation}
        />
      )}
    </div>
  );
}
