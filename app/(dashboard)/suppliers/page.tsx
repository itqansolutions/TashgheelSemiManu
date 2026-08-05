"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, RefreshCw, X, Loader2, CheckCircle,
  ChevronLeft, ChevronRight, Truck, DollarSign, Edit2,
  Phone, Mail, MapPin, User,
} from "lucide-react";
import { toast } from "sonner";

interface Supplier {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxNumber?: string | null;
  openingBalance?: number;
  isActive: boolean;
  createdAt: string;
}

function SupplierModal({
  onClose,
  onSave,
  initial,
}: {
  onClose: () => void;
  onSave: (s: Supplier) => void;
  initial?: Supplier | null;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    address: initial?.address ?? "",
    taxNumber: initial?.taxNumber ?? "",
    openingBalance: initial?.openingBalance?.toString() ?? "0",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("اسم المورد مطلوب");

    setLoading(true);
    try {
      const url = initial ? `/api/suppliers/${initial.id}` : "/api/suppliers";
      const method = initial ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          openingBalance: parseFloat(form.openingBalance || "0"),
        }),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "حدث خطأ");

      toast.success(initial ? "تم تحديث بيانات المورد" : "تم إضافة المورد بنجاح");
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
            <Truck size={20} className="text-primary" />
            {initial ? "تعديل بيانات المورد" : "إضافة مورد جديد"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold mb-1 block">اسم المورد / الشركة *</label>
            <input
              type="text"
              required
              placeholder="شركة الحديد والصلب"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold mb-1 block">رقم الهاتف</label>
              <input
                type="text"
                placeholder="01012345678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold mb-1 block">الرقم الضريبي</label>
              <input
                type="text"
                placeholder="300-123-456"
                value={form.taxNumber}
                onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold mb-1 block">الرصيد الافتتاحي (ج.م)</label>
            <input
              type="number"
              placeholder="0"
              value={form.openingBalance}
              onChange={(e) => setForm({ ...form, openingBalance: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold mb-1 block">العنوان</label>
            <input
              type="text"
              placeholder="القاهرة، مصر"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 bg-primary text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {initial ? "حفظ التعديلات" : "إضافة المورد"}
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

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/suppliers");
      const data = await res.json();
      if (data.success) setSuppliers(data.data ?? []);
    } catch {
      toast.error("فشل تحميل قائمة الموردين");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone ?? "").includes(search)
  );

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleSave = (s: Supplier) => {
    setSuppliers((prev) => {
      const idx = prev.findIndex((x) => x.id === s.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = s;
        return updated;
      }
      return [s, ...prev];
    });
    setShowModal(false);
    setEditingSupplier(null);
  };

  const totalBalance = suppliers.reduce((sum, s) => sum + (s.openingBalance ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">الموردون</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            إدارة موردي المواد الخام والخدمات
          </p>
        </div>
        <button
          onClick={() => { setEditingSupplier(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm active:scale-95 transition-transform shadow-md shadow-primary/20"
        >
          <Plus size={18} />
          <span>مورد جديد</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "إجمالي الموردين", value: suppliers.length.toString(), icon: Truck, color: "#0284c7" },
          { label: "الموردون النشطون", value: suppliers.filter((s) => s.isActive).length.toString(), icon: CheckCircle, color: "#10b981" },
          { label: "إجمالي أرصدة الموردين", value: `${totalBalance.toLocaleString("ar-EG")} ج.م`, icon: DollarSign, color: "#f59e0b" },
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
              placeholder="ابحث بالاسم أو الهاتف..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-9 pr-9 pl-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
            />
          </div>
          <button onClick={fetchSuppliers} className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border text-sm font-semibold hover:bg-muted">
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
              <Truck size={28} />
            </div>
            <h3 className="font-bold text-base mb-1">لا يوجد موردون</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              {search ? "لا توجد نتائج لبحثك" : "أضف أول مورد لمتابعة المشتريات"}
            </p>
            {!search && (
              <button
                onClick={() => { setEditingSupplier(null); setShowModal(true); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
              >
                <Plus size={16} />
                إضافة مورد جديد
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">المورد</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs hidden sm:table-cell">الهاتف</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs hidden md:table-cell">الرقم الضريبي</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">الرصيد</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">الحالة</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {s.name[0]}
                          </div>
                          <div>
                            <p className="font-bold">{s.name}</p>
                            {s.address && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin size={10} /> {s.address}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 hidden sm:table-cell">
                        {s.phone ? (
                          <a href={`tel:${s.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                            <Phone size={13} /> {s.phone}
                          </a>
                        ) : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="p-3.5 hidden md:table-cell text-muted-foreground text-xs">
                        {s.taxNumber ?? "—"}
                      </td>
                      <td className="p-3.5 font-bold">
                        {(s.openingBalance ?? 0).toLocaleString("ar-EG")} ج.م
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                          s.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                        }`}>
                          {s.isActive ? "نشط" : "موقوف"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => { setEditingSupplier(s); setShowModal(true); }}
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
        <SupplierModal
          onClose={() => { setShowModal(false); setEditingSupplier(null); }}
          onSave={handleSave}
          initial={editingSupplier}
        />
      )}
    </div>
  );
}
