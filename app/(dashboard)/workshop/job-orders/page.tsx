"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, RefreshCw, X, Loader2, CheckCircle,
  ChevronLeft, ChevronRight, Wrench, DollarSign, Edit2,
  Clock, AlertCircle, Factory, User, ArrowUpRight,
  CheckCircle2, XCircle,
} from "lucide-react";
import { toast } from "sonner";

type JobStatus =
  | "NEW" | "SURVEYING" | "QUOTED" | "APPROVED" | "PURCHASING"
  | "IN_PRODUCTION" | "IN_FINISHING" | "INSTALLING"
  | "DELIVERED" | "INVOICED" | "COLLECTED" | "CLOSED";

interface JobOrder {
  id: string;
  jobNo: string;
  title: string;
  status: JobStatus;
  priority: string;
  estimatedCost?: number | null;
  actualCost?: number | null;
  notes?: string | null;
  createdAt: string;
  customer?: { id: string; name: string } | null;
}

const STATUS_LABELS: Record<JobStatus, string> = {
  NEW: "جديد",
  SURVEYING: "معاينة",
  QUOTED: "تم تقديم عرض سعر",
  APPROVED: "معتمد",
  PURCHASING: "شراء خامات",
  IN_PRODUCTION: "قيد التصنيع",
  IN_FINISHING: "قيد التجهيز",
  INSTALLING: "قيد التركيب",
  DELIVERED: "تم التسليم",
  INVOICED: "تم الفوترة",
  COLLECTED: "تم التحصيل",
  CLOSED: "مغلق",
};

const STATUS_COLORS: Record<JobStatus, { text: string; bg: string }> = {
  NEW:          { text: "#64748b", bg: "#64748b18" },
  SURVEYING:    { text: "#0284c7", bg: "#0284c718" },
  QUOTED:       { text: "#7c3aed", bg: "#7c3aed18" },
  APPROVED:     { text: "#16a34a", bg: "#16a34a18" },
  PURCHASING:   { text: "#d97706", bg: "#d9770618" },
  IN_PRODUCTION:{ text: "#0891b2", bg: "#0891b218" },
  IN_FINISHING: { text: "#7c3aed", bg: "#7c3aed18" },
  INSTALLING:   { text: "#ea580c", bg: "#ea580c18" },
  DELIVERED:    { text: "#16a34a", bg: "#16a34a18" },
  INVOICED:     { text: "#0284c7", bg: "#0284c718" },
  COLLECTED:    { text: "#16a34a", bg: "#16a34a18" },
  CLOSED:       { text: "#64748b", bg: "#64748b18" },
};

function JobOrderModal({
  onClose,
  onSave,
  initial,
}: {
  onClose: () => void;
  onSave: (j: JobOrder) => void;
  initial?: JobOrder | null;
}) {
  const [form, setForm] = useState({
    customerName: initial?.customer?.name ?? "",
    productName: initial?.title ?? "",
    totalAmount: initial?.estimatedCost ? (initial.estimatedCost / 0.7).toFixed(0) : "",
    notes: initial?.notes ?? "",
    status: initial?.status ?? "IN_PRODUCTION",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim() || !form.productName.trim()) {
      return toast.error("اسم العميل والمنتج مطلوبان");
    }

    setLoading(true);
    try {
      const url = initial ? `/api/workshop/job-orders/${initial.id}` : "/api/workshop/job-orders";
      const method = initial ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          productName: form.productName,
          totalAmount: parseFloat(form.totalAmount || "0"),
          notes: form.notes,
          ...(initial && { status: form.status }),
        }),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "حدث خطأ");

      toast.success(initial ? "تم تحديث أمر العمل" : "تم إنشاء أمر العمل بنجاح");
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
            <Factory size={20} className="text-primary" />
            {initial ? "تعديل أمر العمل" : "إضافة أمر عمل جديد"}
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
            <label className="text-xs font-bold mb-1 block">المنتج / الخدمة المطلوبة *</label>
            <input
              type="text"
              required
              placeholder="تصنيع هيكل حديد 10mm"
              value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold mb-1 block">القيمة الإجمالية (ج.م) *</label>
              <input
                type="number"
                required
                placeholder="15000"
                value={form.totalAmount}
                onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
              />
            </div>
            {initial && (
              <div>
                <label className="text-xs font-bold mb-1 block">الحالة</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as JobStatus })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                >
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold mb-1 block">ملاحظات وتفاصيل</label>
            <textarea
              rows={2}
              placeholder="مواصفات التصنيع، المقاسات، التفاصيل..."
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
              {initial ? "حفظ التعديلات" : "إنشاء أمر العمل"}
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

export default function JobOrdersPage() {
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<JobOrder | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workshop/job-orders");
      const data = await res.json();
      if (data.success) setJobOrders(data.data ?? []);
    } catch {
      toast.error("فشل تحميل أوامر التشغيل");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("new") === "true") {
        setEditingOrder(null);
        setShowModal(true);
      }
    }
  }, [fetchOrders]);

  const filtered = jobOrders.filter((j) => {
    const matchSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.jobNo.toLowerCase().includes(search.toLowerCase()) ||
      (j.customer?.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleSave = (j: JobOrder) => {
    setJobOrders((prev) => {
      const idx = prev.findIndex((x) => x.id === j.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = j;
        return updated;
      }
      return [j, ...prev];
    });
    setShowModal(false);
    setEditingOrder(null);
  };

  const inProgress = jobOrders.filter((j) =>
    ["IN_PRODUCTION", "IN_FINISHING", "INSTALLING"].includes(j.status)
  ).length;

  const totalValue = jobOrders.reduce(
    (s, j) => s + ((j.estimatedCost ?? 0) / 0.7),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">أوامر التشغيل</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            تتبع ومتابعة أوامر التشغيل والإنتاج في الورشة
          </p>
        </div>
        <button
          onClick={() => { setEditingOrder(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm active:scale-95 transition-transform shadow-md shadow-primary/20"
        >
          <Plus size={18} />
          <span>أمر عمل جديد</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الأوامر", value: jobOrders.length.toString(), icon: Wrench, color: "#7c3aed" },
          { label: "قيد التشغيل", value: inProgress.toString(), icon: Factory, color: "#0284c7" },
          { label: "تم التسليم", value: jobOrders.filter((j) => j.status === "DELIVERED" || j.status === "CLOSED").length.toString(), icon: CheckCircle2, color: "#10b981" },
          { label: "إجمالي القيمة", value: `${totalValue.toLocaleString("ar-EG", { maximumFractionDigits: 0 })} ج.م`, icon: DollarSign, color: "#f59e0b" },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
              <div
                style={{ background: `${card.color}18`, color: card.color }}
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              >
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
              placeholder="ابحث برقم الأمر أو العميل أو المنتج..."
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
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border text-sm font-semibold hover:bg-muted"
          >
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
              <Factory size={28} />
            </div>
            <h3 className="font-bold text-base mb-1">لا توجد أوامر عمل</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              {search || statusFilter !== "ALL" ? "لا توجد نتائج لمعايير البحث" : "أنشئ أول أمر عمل لبدء تتبع الإنتاج"}
            </p>
            {!search && statusFilter === "ALL" && (
              <button
                onClick={() => { setEditingOrder(null); setShowModal(true); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
              >
                <Plus size={16} />
                إنشاء أمر عمل
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">رقم الأمر</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">العميل</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">المنتج / الخدمة</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">الحالة</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs hidden md:table-cell">القيمة التقديرية</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs hidden sm:table-cell">التاريخ</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((j) => {
                    const sc = STATUS_COLORS[j.status] ?? { text: "#64748b", bg: "#64748b18" };
                    const estValue = (j.estimatedCost ?? 0) / 0.7;
                    return (
                      <tr key={j.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-primary text-xs">
                          {j.jobNo}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {j.customer?.name?.[0] ?? "?"}
                            </div>
                            <span className="font-semibold text-xs">{j.customer?.name ?? "—"}</span>
                          </div>
                        </td>
                        <td className="p-3.5 max-w-[200px] truncate font-medium">{j.title}</td>
                        <td className="p-3.5">
                          <span
                            style={{ color: sc.text, background: sc.bg }}
                            className="px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                          >
                            {STATUS_LABELS[j.status] ?? j.status}
                          </span>
                        </td>
                        <td className="p-3.5 hidden md:table-cell font-bold">
                          {estValue > 0 ? `${estValue.toLocaleString("ar-EG", { maximumFractionDigits: 0 })} ج.م` : "—"}
                        </td>
                        <td className="p-3.5 hidden sm:table-cell text-muted-foreground text-xs">
                          {new Date(j.createdAt).toLocaleDateString("ar-EG")}
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => { setEditingOrder(j); setShowModal(true); }}
                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                            title="تعديل"
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
        <JobOrderModal
          onClose={() => { setShowModal(false); setEditingOrder(null); }}
          onSave={handleSave}
          initial={editingOrder}
        />
      )}
    </div>
  );
}
