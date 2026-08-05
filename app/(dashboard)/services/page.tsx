"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, RefreshCw, X, Loader2, CheckCircle,
  ChevronLeft, ChevronRight, Wrench, DollarSign, Edit2,
  Tag, BarChart2,
} from "lucide-react";
import { toast } from "sonner";

interface ServiceItem {
  id: string;
  name: string;
  code?: string | null;
  defaultCost: number;
  defaultPrice: number;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
}

function ServiceModal({
  onClose,
  onSave,
  initial,
}: {
  onClose: () => void;
  onSave: (s: ServiceItem) => void;
  initial?: ServiceItem | null;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    code: initial?.code ?? "",
    defaultCost: initial?.defaultCost?.toString() ?? "",
    defaultPrice: initial?.defaultPrice?.toString() ?? "",
    description: initial?.description ?? "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("اسم الخدمة مطلوب");

    setLoading(true);
    try {
      const url = initial ? `/api/services/${initial.id}` : "/api/services";
      const method = initial ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          code: form.code,
          defaultCost: parseFloat(form.defaultCost || "0"),
          defaultPrice: parseFloat(form.defaultPrice || "0"),
          description: form.description,
        }),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "حدث خطأ");

      toast.success(initial ? "تم تحديث الخدمة" : "تم إضافة الخدمة بنجاح");
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
            <Wrench size={20} className="text-primary" />
            {initial ? "تعديل الخدمة" : "إضافة خدمة تشغيل جديدة"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold mb-1 block">اسم الخدمة *</label>
            <input
              type="text"
              required
              placeholder="قص وتقطيع ليزر / لحام وكبس / خراطة"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold mb-1 block">كود الخدمة</label>
              <input
                type="text"
                placeholder="SRV-001"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold mb-1 block">سعر التكلفة (ج.م)</label>
              <input
                type="number"
                placeholder="200"
                value={form.defaultCost}
                onChange={(e) => setForm({ ...form, defaultCost: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold mb-1 block">سعر البيع / الخدمة (ج.م) *</label>
            <input
              type="number"
              required
              placeholder="350"
              value={form.defaultPrice}
              onChange={(e) => setForm({ ...form, defaultPrice: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold mb-1 block">الوصف والتفاصيل</label>
            <textarea
              rows={2}
              placeholder="تفاصيل طريقة تنفيذ الخدمة..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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
              {initial ? "حفظ التعديلات" : "إضافة الخدمة"}
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

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/services");
      const data = await res.json();
      if (data.success) setServices(data.data ?? []);
    } catch {
      toast.error("فشل تحميل قائمة الخدمات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("new") === "true") {
        setEditingService(null);
        setShowModal(true);
      }
    }
  }, [fetchServices]);

  const filtered = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.code ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleSave = (s: ServiceItem) => {
    setServices((prev) => {
      const idx = prev.findIndex((x) => x.id === s.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = s;
        return updated;
      }
      return [s, ...prev];
    });
    setShowModal(false);
    setEditingService(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">الخدمات وأعمال التشغيل</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            إدارة قائمة الخدمات المقدمة وأسعارها وتكلفتها
          </p>
        </div>
        <button
          onClick={() => { setEditingService(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm active:scale-95 transition-transform shadow-md shadow-primary/20"
        >
          <Plus size={18} />
          <span>خدمة جديدة</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "إجمالي الخدمات", value: services.length.toString(), icon: Wrench, color: "#0284c7" },
          { label: "الخدمات النشطة", value: services.filter((s) => s.isActive).length.toString(), icon: CheckCircle, color: "#10b981" },
          { label: "متوسط سعر الخدمة", value: `${(services.length ? services.reduce((acc, s) => acc + Number(s.defaultPrice || 0), 0) / services.length : 0).toLocaleString("ar-EG", { maximumFractionDigits: 0 })} ج.م`, icon: DollarSign, color: "#7c3aed" },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
              <div style={{ background: `${card.color}18`, color: card.color }} className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={22} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">{card.label}</p>
                <p className="text-2xl font-black">{card.value}</p>
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
              placeholder="ابحث باسم الخدمة أو الكود..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-9 pr-9 pl-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
            />
          </div>
          <button onClick={fetchServices} className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border text-sm font-semibold hover:bg-muted">
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
              <Wrench size={28} />
            </div>
            <h3 className="font-bold text-base mb-1">لا توجد خدمات مسجلة</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              {search ? "لا توجد نتائج لبحثك" : "أضف أول خدمة لبدء تضمينها في الفواتير وعروض الأسعار"}
            </p>
            {!search && (
              <button
                onClick={() => { setEditingService(null); setShowModal(true); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
              >
                <Plus size={16} />
                إضافة خدمة جديدة
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">الخدمة</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs hidden sm:table-cell">الكود</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">سعر التكلفة</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">سعر البيع</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">الحالة</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((srv) => (
                    <tr key={srv.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center flex-shrink-0">
                            <Wrench size={18} />
                          </div>
                          <div>
                            <p className="font-bold">{srv.name}</p>
                            {srv.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {srv.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 hidden sm:table-cell font-mono text-xs text-muted-foreground">
                        {srv.code ?? "—"}
                      </td>
                      <td className="p-3.5 font-semibold">
                        {Number(srv.defaultCost).toLocaleString("ar-EG")} ج.م
                      </td>
                      <td className="p-3.5 font-extrabold text-primary">
                        {Number(srv.defaultPrice).toLocaleString("ar-EG")} ج.م
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                          srv.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                        }`}>
                          {srv.isActive ? "نشطة" : "موقوفة"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => { setEditingService(srv); setShowModal(true); }}
                          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
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
        <ServiceModal
          onClose={() => { setShowModal(false); setEditingService(null); }}
          onSave={handleSave}
          initial={editingService}
        />
      )}
    </div>
  );
}
