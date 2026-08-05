"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, RefreshCw, X, Loader2, CheckCircle,
  ChevronLeft, ChevronRight, DollarSign, Edit2,
  Calendar, FileText, Tag, Receipt,
} from "lucide-react";
import { toast } from "sonner";

interface Expense {
  id: string;
  expenseNo: string;
  amount: number;
  description: string;
  referenceNo?: string | null;
  notes?: string | null;
  date: string;
  createdAt: string;
}

function ExpenseModal({
  onClose,
  onSave,
  initial,
}: {
  onClose: () => void;
  onSave: (exp: Expense) => void;
  initial?: Expense | null;
}) {
  const [form, setForm] = useState({
    description: initial?.description ?? "",
    amount: initial?.amount?.toString() ?? "",
    referenceNo: initial?.referenceNo ?? "",
    notes: initial?.notes ?? "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim() || !form.amount) {
      return toast.error("وصف المصروف والمبلغ مطلوبان");
    }

    setLoading(true);
    try {
      const url = initial ? `/api/expenses/${initial.id}` : "/api/expenses";
      const method = initial ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: form.description,
          amount: parseFloat(form.amount || "0"),
          referenceNo: form.referenceNo,
          notes: form.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "حدث خطأ");

      toast.success(initial ? "تم تحديث المصروف" : "تم تسجيل المصروف بنجاح");
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
            <Receipt size={20} className="text-primary" />
            {initial ? "تعديل المصروف" : "تسجيل مصروف جديد"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold mb-1 block">وصف المصروف *</label>
            <input
              type="text"
              required
              placeholder="صيانة معدات / فواتير كهرباء / نقل خامات"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold mb-1 block">المبلغ (ج.م) *</label>
              <input
                type="number"
                required
                placeholder="1500"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold mb-1 block">رقم السند / الإيصال</label>
              <input
                type="text"
                placeholder="REC-1024"
                value={form.referenceNo}
                onChange={(e) => setForm({ ...form, referenceNo: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold mb-1 block">ملاحظات وتفاصيل</label>
            <textarea
              rows={2}
              placeholder="ملاحظات حول سبب الصرف..."
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
              {initial ? "حفظ التعديلات" : "تسجيل المصروف"}
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

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/expenses");
      const data = await res.json();
      if (data.success) setExpenses(data.data ?? []);
    } catch {
      toast.error("فشل تحميل قائمة المصروفات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("new") === "true") {
        setEditingExpense(null);
        setShowModal(true);
      }
    }
  }, [fetchExpenses]);

  const filtered = expenses.filter(
    (e) =>
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.expenseNo.toLowerCase().includes(search.toLowerCase()) ||
      (e.referenceNo ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const handleSave = (exp: Expense) => {
    setExpenses((prev) => {
      const idx = prev.findIndex((x) => x.id === exp.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = exp;
        return updated;
      }
      return [exp, ...prev];
    });
    setShowModal(false);
    setEditingExpense(null);
  };

  const totalAmount = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">المصروفات النثرية والتشغيلية</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            متابعة وإدارة كافة مصاريف الورشة والتشغيل
          </p>
        </div>
        <button
          onClick={() => { setEditingExpense(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm active:scale-95 transition-transform shadow-md shadow-primary/20"
        >
          <Plus size={18} />
          <span>تسجيل مصروف</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "إجمالي السندات", value: expenses.length.toString(), icon: Receipt, color: "#7c3aed" },
          { label: "إجمالي المصروفات", value: `${totalAmount.toLocaleString("ar-EG", { maximumFractionDigits: 0 })} ج.م`, icon: DollarSign, color: "#ef4444" },
          { label: "متوسط قيمة المصروف", value: `${(expenses.length ? totalAmount / expenses.length : 0).toLocaleString("ar-EG", { maximumFractionDigits: 0 })} ج.م`, icon: Calendar, color: "#f59e0b" },
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
              placeholder="ابحث بالوصف أو رقم السند..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-9 pr-9 pl-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
            />
          </div>
          <button onClick={fetchExpenses} className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border text-sm font-semibold hover:bg-muted">
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
              <Receipt size={28} />
            </div>
            <h3 className="font-bold text-base mb-1">لا توجد مصروفات مسجلة</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              {search ? "لا توجد نتائج لبحثك" : "سجل أول مصروف متابعة تكاليف التشغيل"}
            </p>
            {!search && (
              <button
                onClick={() => { setEditingExpense(null); setShowModal(true); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
              >
                <Plus size={16} />
                تسجيل مصروف
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">رقم السند</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">وصف المصروف</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">المبلغ</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs hidden sm:table-cell">المرجع</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs hidden sm:table-cell">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((exp) => (
                    <tr key={exp.id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-primary text-xs">
                        {exp.expenseNo}
                      </td>
                      <td className="p-3.5 font-bold">
                        {exp.description}
                      </td>
                      <td className="p-3.5 font-extrabold text-destructive">
                        {Number(exp.amount).toLocaleString("ar-EG")} ج.م
                      </td>
                      <td className="p-3.5 hidden sm:table-cell text-muted-foreground text-xs">
                        {exp.referenceNo ?? "—"}
                      </td>
                      <td className="p-3.5 hidden sm:table-cell text-muted-foreground text-xs">
                        {new Date(exp.createdAt).toLocaleDateString("ar-EG")}
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
        <ExpenseModal
          onClose={() => { setShowModal(false); setEditingExpense(null); }}
          onSave={handleSave}
          initial={editingExpense}
        />
      )}
    </div>
  );
}
