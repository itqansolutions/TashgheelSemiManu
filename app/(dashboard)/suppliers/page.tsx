"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, RefreshCw, X, Loader2, CheckCircle,
  ChevronLeft, ChevronRight, Truck, DollarSign, Edit2,
  Phone, Mail, MapPin, User, Paperclip, Printer, CreditCard, FileText,
} from "lucide-react";
import { toast } from "sonner";
import PrintPortal from "@/components/global/PrintPortal";

interface Supplier {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  taxNumber?: string | null;
  openingBalance?: number;
  currentBalance?: number;
  isActive: boolean;
  createdAt: string;
}

interface StatementData {
  supplier: { id: string; name: string; phone?: string; taxNumber?: string; address?: string };
  openingBalance: number;
  finalBalance: number;
  transactions: Array<{
    id: string;
    date: string;
    type: "PURCHASE" | "PAYMENT";
    docNo: string;
    description: string;
    credit: number;
    debit: number;
    balanceAfter: number;
    notes?: string | null;
  }>;
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
                placeholder="01000000000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold mb-1 block">الرقم الضريبي</label>
              <input
                type="text"
                placeholder="123-456-789"
                value={form.taxNumber}
                onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold mb-1 block">البريد الإلكتروني</label>
            <input
              type="email"
              placeholder="supplier@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold mb-1 block">العنوان</label>
            <input
              type="text"
              placeholder="العاشر من رمضان، المنطقة الصناعية"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold mb-1 block">الرصيد الافتتاحي المستحق للمورد (ج.م)</label>
            <input
              type="number"
              placeholder="0"
              value={form.openingBalance}
              onChange={(e) => setForm({ ...form, openingBalance: e.target.value })}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
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

// Modal for Supplier Payment (سند صرف / سداد)
function SupplierPaymentModal({
  supplier,
  onClose,
  onSuccess,
}: {
  supplier: Supplier;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return toast.error("أدخل مبلغ سداد صحيح");

    setLoading(true);
    try {
      const res = await fetch(`/api/suppliers/${supplier.id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          referenceNo,
          notes,
          attachmentName,
        }),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "حدث خطأ أثناء التسديد");

      toast.success(`تم تسجيل سداد ${parseFloat(amount).toLocaleString("ar-EG")} ج.م للمورد بنجاح`);
      onSuccess();
      onClose();
    } catch {
      toast.error("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-extrabold flex items-center gap-2">
            <CreditCard size={18} className="text-blue-600" />
            تسجيل سند صرف / سداد - {supplier.name}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handlePayment} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold mb-1 block">المبلغ المدفوع للمورد (ج.م) *</label>
            <input
              type="number"
              required
              step="0.01"
              placeholder="5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-base font-black text-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold mb-1 block">رقم المرجع / الشيك / التحويل</label>
            <input
              type="text"
              placeholder="CHK-4491 / تحويل بنكي"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold mb-1 block">ملاحظات سداد المورد</label>
            <textarea
              rows={2}
              placeholder="دفعة مشتريات خامات / سداد فاتورة..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none"
            />
          </div>

          {/* Attachment Upload Field */}
          <div>
            <label className="text-xs font-bold mb-1 block flex items-center gap-1">
              <Paperclip size={14} className="text-primary" />
              إرفاق صورة إيصال / تحويل / مرفق
            </label>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setAttachmentName(file.name);
              }}
              className="w-full text-xs text-muted-foreground file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {attachmentName && (
              <p className="text-[11px] text-blue-600 font-semibold mt-1">
                ✓ تم تحديد المرفق: {attachmentName}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 bg-blue-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              تسجيل سداد المورد
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-11 border border-border text-sm font-semibold rounded-xl"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal for Supplier Statement of Account (كشف حساب المورد)
function SupplierStatementModal({
  supplierId,
  onClose,
}: {
  supplierId: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<StatementData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStatement() {
      try {
        const res = await fetch(`/api/suppliers/${supplierId}/statement`);
        const result = await res.json();
        if (result.success) setData(result.data);
      } catch {
        toast.error("فشل تحميل كشف حساب المورد");
      } finally {
        setLoading(false);
      }
    }
    loadStatement();
  }, [supplierId]);

  return (
    <PrintPortal>
      <div className="printable-modal-overlay fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
        <div className="printable-modal-card bg-card w-full max-w-4xl rounded-2xl border border-border shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3 print:hidden">
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            كشف حساب تفصيلي للمورد
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-primary/90"
            >
              <Printer size={15} /> طباعة كشف الحساب
            </button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
              <X size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : !data ? (
          <div className="text-center py-12 text-muted-foreground">تعذر تحميل بيانات كشف الحساب</div>
        ) : (
          <div className="space-y-5 print:space-y-4">
            {/* Header info for print */}
            <div className="bg-muted/30 p-4 rounded-xl border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-xl font-black">{data.supplier.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {data.supplier.phone && `هاتف: ${data.supplier.phone} • `}
                  {data.supplier.taxNumber && `الرقم الضريبي: ${data.supplier.taxNumber}`}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-muted-foreground font-semibold block">المستحق للمورد حالياً:</span>
                <span className={`text-xl font-black ${data.finalBalance > 0 ? "text-blue-600" : "text-emerald-600"}`}>
                  {data.finalBalance.toLocaleString("ar-EG")} ج.م
                </span>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-muted/60 border-b border-border">
                    <th className="p-3 font-bold">التاريخ</th>
                    <th className="p-3 font-bold">نوع الحركة / المستند</th>
                    <th className="p-3 font-bold">البيان والوصف</th>
                    <th className="p-3 font-bold">مشتريات للمورد (+)</th>
                    <th className="p-3 font-bold">مسدد للمورد (-)</th>
                    <th className="p-3 font-bold bg-primary/10">الرصيد بعد الحركة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {/* Opening Balance Row */}
                  <tr className="bg-muted/20 font-bold">
                    <td className="p-3">—</td>
                    <td className="p-3 text-primary">رصيد افتتاحي</td>
                    <td className="p-3">الرصيد الافتتاحي المستحق للمورد عند التسجيل</td>
                    <td className="p-3">{data.openingBalance > 0 ? `${data.openingBalance.toLocaleString("ar-EG")} ج.م` : "—"}</td>
                    <td className="p-3">{data.openingBalance < 0 ? `${Math.abs(data.openingBalance).toLocaleString("ar-EG")} ج.م` : "—"}</td>
                    <td className="p-3 bg-primary/5 font-extrabold">{data.openingBalance.toLocaleString("ar-EG")} ج.م</td>
                  </tr>

                  {data.transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/10">
                      <td className="p-3 whitespace-nowrap">{new Date(tx.date).toLocaleDateString("ar-EG")}</td>
                      <td className="p-3 font-mono font-bold">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] ${
                          tx.type === "PURCHASE" ? "bg-amber-500/10 text-amber-600" : "bg-blue-500/10 text-blue-600"
                        }`}>
                          {tx.docNo}
                        </span>
                      </td>
                      <td className="p-3">
                        <p className="font-semibold">{tx.description}</p>
                        {tx.notes && <p className="text-[11px] text-muted-foreground">{tx.notes}</p>}
                      </td>
                      <td className="p-3 font-bold text-amber-600">
                        {tx.credit > 0 ? `${tx.credit.toLocaleString("ar-EG")} ج.م` : "—"}
                      </td>
                      <td className="p-3 font-bold text-blue-600">
                        {tx.debit > 0 ? `${tx.debit.toLocaleString("ar-EG")} ج.م` : "—"}
                      </td>
                      <td className="p-3 font-black bg-primary/5">
                        {tx.balanceAfter.toLocaleString("ar-EG")} ج.م
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  </PrintPortal>
  );
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [paymentSupplier, setPaymentSupplier] = useState<Supplier | null>(null);
  const [statementSupplierId, setStatementSupplierId] = useState<string | null>(null);

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

  useEffect(() => {
    fetchSuppliers();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("new") === "true") {
        setEditingSupplier(null);
        setShowModal(true);
      }
    }
  }, [fetchSuppliers]);

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone ?? "").includes(search) ||
      (s.email ?? "").toLowerCase().includes(search.toLowerCase())
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

  const totalCurrentBalance = suppliers.reduce(
    (sum, s) => sum + Number(s.currentBalance ?? s.openingBalance ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">إدارة الموردين وكشوف الحسابات</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            متابعة الأرصدة الحالية للموردين وسداد الفواتير وطباعة كشوف حسابات التوريد
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
          { label: "إجمالي الأرصدة الحالية المستحقة للموردين", value: `${totalCurrentBalance.toLocaleString("ar-EG")} ج.م`, icon: DollarSign, color: "#7c3aed" },
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
              placeholder="ابحث باسم المورد أو رقم الهاتف..."
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
              {search ? "لا توجد نتائج لبحثك" : "أضف أول مورد لبدء تسجيل فواتير الشراء والتوريد"}
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
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">الهاتف</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs hidden sm:table-cell">العنوان</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">الرصيد الحالي</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">الإجراءات والخدمات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((s) => {
                    const bal = Number(s.currentBalance ?? s.openingBalance ?? 0);
                    return (
                      <tr key={s.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {s.name[0]}
                            </div>
                            <div>
                              <p className="font-bold">{s.name}</p>
                              {s.taxNumber && (
                                <p className="text-xs text-muted-foreground">ضريبي: {s.taxNumber}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-xs">
                          {s.phone ? (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Phone size={13} /> {s.phone}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="p-3.5 hidden sm:table-cell text-muted-foreground text-xs">
                          {s.address ? (
                            <span className="flex items-center gap-1">
                              <MapPin size={13} /> {s.address}
                            </span>
                          ) : "—"}
                        </td>
                        <td className={`p-3.5 font-black ${bal > 0 ? "text-blue-600" : bal < 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                          {bal.toLocaleString("ar-EG")} ج.م
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            {/* Payment Button */}
                            <button
                              onClick={() => setPaymentSupplier(s)}
                              className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-blue-700 active:scale-95 transition-transform"
                              title="تسجيل سداد للمورد"
                            >
                              <CreditCard size={13} /> سداد
                            </button>

                            {/* Statement Button */}
                            <button
                              onClick={() => setStatementSupplierId(s.id)}
                              className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-primary/20 active:scale-95 transition-transform"
                              title="عرض وطباعة كشف الحساب"
                            >
                              <FileText size={13} /> كشف حساب
                            </button>

                            <button
                              onClick={() => { setEditingSupplier(s); setShowModal(true); }}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                            >
                              <Edit2 size={15} />
                            </button>
                          </div>
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
        <SupplierModal
          onClose={() => { setShowModal(false); setEditingSupplier(null); }}
          onSave={handleSave}
          initial={editingSupplier}
        />
      )}

      {paymentSupplier && (
        <SupplierPaymentModal
          supplier={paymentSupplier}
          onClose={() => setPaymentSupplier(null)}
          onSuccess={fetchSuppliers}
        />
      )}

      {statementSupplierId && (
        <SupplierStatementModal
          supplierId={statementSupplierId}
          onClose={() => setStatementSupplierId(null)}
        />
      )}
    </div>
  );
}
