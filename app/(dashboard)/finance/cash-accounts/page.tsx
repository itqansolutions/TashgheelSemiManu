"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, RefreshCw, X, Loader2, CheckCircle,
  ChevronLeft, ChevronRight, DollarSign, Edit2,
  Building2, Landmark, Wallet,
} from "lucide-react";
import { toast } from "sonner";

interface CashAccount {
  id: string;
  name: string;
  currency: string;
  openingBalance: number;
  notes?: string | null;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
}

function CashAccountModal({
  onClose,
  onSave,
  initial,
}: {
  onClose: () => void;
  onSave: (acc: CashAccount) => void;
  initial?: CashAccount | null;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    openingBalance: initial?.openingBalance?.toString() ?? "0",
    notes: initial?.notes ?? "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("اسم الخزينة مطلوب");

    setLoading(true);
    try {
      const url = initial ? `/api/finance/cash-accounts/${initial.id}` : "/api/finance/cash-accounts";
      const method = initial ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          openingBalance: parseFloat(form.openingBalance || "0"),
          notes: form.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "حدث خطأ");

      toast.success(initial ? "تم تحديث الخزينة" : "تم إضافة الخزينة بنجاح");
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
            <Wallet size={20} className="text-primary" />
            {initial ? "تعديل الخزينة" : "إضافة خزينة / حساب نقدي جديد"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold mb-1 block">اسم الخزينة / الحساب *</label>
            <input
              type="text"
              required
              placeholder="الخزينة الرئيسية / حساب بنك مصر"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-xs font-bold mb-1 block">الرصيد الافتتاحي (ج.م)</label>
            <input
              type="number"
              placeholder="10000"
              value={form.openingBalance}
              onChange={(e) => setForm({ ...form, openingBalance: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold mb-1 block">ملاحظات وتفاصيل</label>
            <textarea
              rows={2}
              placeholder="تفاصيل الحساب أو الخزينة..."
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
              {initial ? "حفظ التعديلات" : "إضافة الخزينة"}
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

export default function CashAccountsPage() {
  const [accounts, setAccounts] = useState<CashAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CashAccount | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/finance/cash-accounts");
      const data = await res.json();
      if (data.success) setAccounts(data.data ?? []);
    } catch {
      toast.error("فشل تحميل قائمة الخزائن");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("new") === "true") {
        setEditingAccount(null);
        setShowModal(true);
      }
    }
  }, [fetchAccounts]);

  const filtered = accounts.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleSave = (acc: CashAccount) => {
    setAccounts((prev) => {
      const idx = prev.findIndex((x) => x.id === acc.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = acc;
        return updated;
      }
      return [acc, ...prev];
    });
    setShowModal(false);
    setEditingAccount(null);
  };

  const totalBalance = accounts.reduce(
    (acc, a) => acc + Number(a.openingBalance || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">الخزائن والحسابات النقدية</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            إدارة أرصدة الخزائن الرئيسية وحسابات البنوك النقدية
          </p>
        </div>
        <button
          onClick={() => { setEditingAccount(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm active:scale-95 transition-transform shadow-md shadow-primary/20"
        >
          <Plus size={18} />
          <span>خزينة جديدة</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "إجمالي الحسابات", value: accounts.length.toString(), icon: Wallet, color: "#7c3aed" },
          { label: "إجمالي الأرصدة النقدية", value: `${totalBalance.toLocaleString("ar-EG")} ج.م`, icon: DollarSign, color: "#10b981" },
          { label: "العملة الرئيسية", value: "الجنيه المصري (ج.م)", icon: Landmark, color: "#0284c7" },
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
              placeholder="ابحث باسم الخزينة..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-9 pr-9 pl-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
            />
          </div>
          <button onClick={fetchAccounts} className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border text-sm font-semibold hover:bg-muted">
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
              <Wallet size={28} />
            </div>
            <h3 className="font-bold text-base mb-1">لا توجد خزائن مسجلة</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              {search ? "لا توجد نتائج لبحثك" : "أضف أول خزينة لتتبع الحركة المالية للورشة"}
            </p>
            {!search && (
              <button
                onClick={() => { setEditingAccount(null); setShowModal(true); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
              >
                <Plus size={16} />
                إضافة خزينة جديدة
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">اسم الخزينة / الحساب</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">الرصيد الافتتاحي</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs hidden sm:table-cell">العملة</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs font-bold">الحالة</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((acc) => (
                    <tr key={acc.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                            <Wallet size={18} />
                          </div>
                          <div>
                            <p className="font-bold">{acc.name}</p>
                            {acc.notes && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {acc.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-extrabold text-emerald-600">
                        {Number(acc.openingBalance).toLocaleString("ar-EG")} ج.م
                      </td>
                      <td className="p-3.5 hidden sm:table-cell font-semibold text-xs">
                        {acc.currency ?? "EGP"}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                          acc.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                        }`}>
                          {acc.isActive ? "نشط" : "موقوف"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <button
                          onClick={() => { setEditingAccount(acc); setShowModal(true); }}
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
        <CashAccountModal
          onClose={() => { setShowModal(false); setEditingAccount(null); }}
          onSave={handleSave}
          initial={editingAccount}
        />
      )}
    </div>
  );
}
