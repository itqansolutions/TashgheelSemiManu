"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, RefreshCw, X, Loader2, CheckCircle,
  ChevronLeft, ChevronRight, Boxes, DollarSign, Edit2,
  Package, AlertTriangle, Tag, BarChart2,
} from "lucide-react";
import { toast } from "sonner";

interface Item {
  id: string;
  name: string;
  code?: string | null;
  defaultCost: number;
  defaultPrice: number;
  isActive: boolean;
  createdAt: string;
}

function ItemModal({
  onClose,
  onSave,
  initial,
}: {
  onClose: () => void;
  onSave: (i: Item) => void;
  initial?: Item | null;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    sku: initial?.code ?? "",
    unit: "قطعة",
    costPrice: initial?.defaultCost?.toString() ?? "",
    salePrice: initial?.defaultPrice?.toString() ?? "",
    initialStock: "0",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("اسم الصنف مطلوب");

    setLoading(true);
    try {
      const url = initial ? `/api/items/${initial.id}` : "/api/items";
      const method = initial ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          costPrice: parseFloat(form.costPrice || "0"),
          salePrice: parseFloat(form.salePrice || "0"),
          initialStock: parseFloat(form.initialStock || "0"),
        }),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "حدث خطأ");

      toast.success(initial ? "تم تحديث بيانات الصنف" : "تم إضافة الصنف بنجاح");
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
            <Package size={20} className="text-primary" />
            {initial ? "تعديل الصنف" : "إضافة صنف مخزني جديد"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold mb-1 block">اسم الصنف / الخامة *</label>
            <input
              type="text"
              required
              placeholder="حديد زاوية 50×50mm"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold mb-1 block">كود الصنف / SKU</label>
              <input
                type="text"
                placeholder="RAW-001"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold mb-1 block">وحدة القياس</label>
              <input
                type="text"
                placeholder="قطعة / طن / متر"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold mb-1 block">سعر التكلفة (ج.م)</label>
              <input
                type="number"
                placeholder="500"
                value={form.costPrice}
                onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold mb-1 block">سعر البيع (ج.م)</label>
              <input
                type="number"
                placeholder="750"
                value={form.salePrice}
                onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
              />
            </div>
          </div>

          {!initial && (
            <div>
              <label className="text-xs font-bold mb-1 block">الرصيد الابتدائي بالمخزن</label>
              <input
                type="number"
                placeholder="0"
                value={form.initialStock}
                onChange={(e) => setForm({ ...form, initialStock: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
              />
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 bg-primary text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {initial ? "حفظ التعديلات" : "إضافة للمخزن"}
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

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      if (data.success) setItems(data.data ?? []);
    } catch {
      toast.error("فشل تحميل قائمة الأصناف");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("new") === "true") {
        setEditingItem(null);
        setShowModal(true);
      }
    }
  }, [fetchItems]);

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.code ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleSave = (item: Item) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id === item.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = item;
        return updated;
      }
      return [item, ...prev];
    });
    setShowModal(false);
    setEditingItem(null);
  };

  const avgMargin =
    items.length > 0
      ? items.reduce((s, i) => {
          const cost = i.defaultCost || 1;
          const price = i.defaultPrice || cost;
          return s + ((price - cost) / cost) * 100;
        }, 0) / items.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">الأصناف والمخزن</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            إدارة المواد الخام والمنتجات والأصناف بالمخزن
          </p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm active:scale-95 transition-transform shadow-md shadow-primary/20"
        >
          <Plus size={18} />
          <span>صنف جديد</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "إجمالي الأصناف",
            value: items.length.toString(),
            icon: Boxes,
            color: "#7c3aed",
          },
          {
            label: "الأصناف النشطة",
            value: items.filter((i) => i.isActive).length.toString(),
            icon: Package,
            color: "#10b981",
          },
          {
            label: "متوسط هامش الربح",
            value: `${avgMargin.toFixed(1)}%`,
            icon: BarChart2,
            color: "#f59e0b",
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
              <div
                style={{ background: `${card.color}18`, color: card.color }}
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              >
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
              placeholder="ابحث بالاسم أو الكود..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-9 pr-9 pl-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
            />
          </div>
          <button
            onClick={fetchItems}
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
              <Boxes size={28} />
            </div>
            <h3 className="font-bold text-base mb-1">لا توجد أصناف</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              {search ? "لا توجد نتائج لبحثك" : "أضف أول صنف للمخزن لبدء التست"}
            </p>
            {!search && (
              <button
                onClick={() => { setEditingItem(null); setShowModal(true); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
              >
                <Plus size={16} />
                إضافة صنف جديد
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">الصنف</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs hidden sm:table-cell">الكود</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">سعر التكلفة</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">سعر البيع</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs hidden md:table-cell">هامش الربح</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">الحالة</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((item) => {
                    const cost = item.defaultCost || 0;
                    const price = item.defaultPrice || 0;
                    const margin = cost > 0 ? ((price - cost) / cost) * 100 : 0;
                    const marginColor = margin >= 20 ? "#10b981" : margin >= 0 ? "#f59e0b" : "#ef4444";
                    return (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                              <Package size={18} />
                            </div>
                            <p className="font-bold">{item.name}</p>
                          </div>
                        </td>
                        <td className="p-3.5 hidden sm:table-cell">
                          <span className="px-2 py-0.5 bg-muted rounded text-xs font-mono">
                            {item.code ?? "—"}
                          </span>
                        </td>
                        <td className="p-3.5 font-semibold">
                          {cost.toLocaleString("ar-EG")} ج.م
                        </td>
                        <td className="p-3.5 font-semibold">
                          {price.toLocaleString("ar-EG")} ج.م
                        </td>
                        <td className="p-3.5 hidden md:table-cell">
                          <span
                            style={{ color: marginColor, background: `${marginColor}18` }}
                            className="px-2.5 py-1 rounded-full text-xs font-bold"
                          >
                            {margin.toFixed(1)}%
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                          }`}>
                            {item.isActive ? "نشط" : "موقوف"}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => { setEditingItem(item); setShowModal(true); }}
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
        <ItemModal
          onClose={() => { setShowModal(false); setEditingItem(null); }}
          onSave={handleSave}
          initial={editingItem}
        />
      )}
    </div>
  );
}
