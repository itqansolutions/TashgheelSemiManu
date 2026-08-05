"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, RefreshCw, X, Loader2, CheckCircle,
  ChevronLeft, ChevronRight, FileText, DollarSign, Edit2,
  Clock, CheckCircle2, Trash2, Wrench, Package,
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
  items?: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
}

interface LineItemRow {
  id: string;
  type: "item" | "service";
  itemId?: string;
  serviceId?: string;
  description: string;
  length?: number;
  width?: number;
  height?: number;
  quantity: number;
  unitPrice: number;
  total: number;
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
    taxPercent: "0",
    notes: initial?.notes ?? "",
    status: initial?.status ?? "DRAFT",
  });

  const [lineItems, setLineItems] = useState<LineItemRow[]>(
    initial?.items && initial.items.length > 0
      ? initial.items.map((it, idx) => ({
          id: idx.toString(),
          type: "item",
          description: it.description,
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          total: Number(it.total) || 0,
        }))
      : [
          {
            id: Date.now().toString(),
            type: "item",
            description: "",
            length: 1,
            width: 1,
            height: 1,
            quantity: 1,
            unitPrice: 0,
            total: 0,
          },
        ]
  );

  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
  const [availableItems, setAvailableItems] = useState<Array<{ id: string; name: string; defaultPrice: number }>>([]);
  const [availableServices, setAvailableServices] = useState<Array<{ id: string; name: string; defaultPrice: number }>>([]);
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [resC, resI, resS] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/items"),
          fetch("/api/services"),
        ]);
        const dataC = await resC.json();
        const dataI = await resI.json();
        const dataS = await resS.json();

        if (dataC.success && Array.isArray(dataC.data)) {
          setCustomers(dataC.data);
          if (!initial && dataC.data.length > 0 && !form.customerName) {
            setForm((prev) => ({ ...prev, customerName: dataC.data[0].name }));
          }
        }
        if (dataI.success && Array.isArray(dataI.data)) setAvailableItems(dataI.data);
        if (dataS.success && Array.isArray(dataS.data)) setAvailableServices(dataS.data);
      } catch {
        // silent
      } finally {
        setFetchingData(false);
      }
    }
    loadData();
  }, [initial, form.customerName]);

  const updateLineItem = (id: string, fields: Partial<LineItemRow>) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...fields };

        // Auto compute total
        const l = updated.length || 1;
        const w = updated.width || 1;
        const h = updated.height || 1;
        const qty = updated.quantity || 1;
        const price = updated.unitPrice || 0;

        updated.total = qty * l * w * h * price;
        return updated;
      })
    );
  };

  const addLineRow = (type: "item" | "service") => {
    setLineItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type,
        description: "",
        length: 1,
        width: 1,
        height: 1,
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const removeLineRow = (id: string) => {
    setLineItems((prev) => prev.filter((it) => it.id !== id));
  };

  const computedSubtotal = lineItems.reduce((acc, row) => acc + (row.total || 0), 0);
  const taxAmount = computedSubtotal * (parseFloat(form.taxPercent || "0") / 100);
  const grandTotal = computedSubtotal + taxAmount;

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
          totalAmount: computedSubtotal,
          taxPercent: parseFloat(form.taxPercent || "0"),
          notes: form.notes,
          lineItems: lineItems.map((li) => ({
            description: li.description || (li.type === "item" ? "صنف" : "خدمة"),
            quantity: li.quantity,
            unitPrice: li.unitPrice,
            total: li.total,
            itemId: li.itemId,
            serviceId: li.serviceId,
          })),
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
      <div className="bg-card w-full max-w-3xl rounded-2xl border border-border shadow-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            {initial ? "تعديل الفاتورة" : "إصدار فاتورة مبيعات جديدة بالتفاصيل والمقاسات"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold mb-1 block">اختر العميل *</label>
              {fetchingData ? (
                <div className="h-10 px-3 rounded-lg border border-border bg-background flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 size={14} className="animate-spin" />
                  جاري تحميل البيانات...
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
              <label className="text-xs font-bold mb-1 block">موضوع الفاتورة (مثلاً: تصنيع شباك مفصلي) *</label>
              <input
                type="text"
                required
                placeholder="تصنيع وتركيب هياكل حديد"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Line Items Breakdown (الأصناف والخدمات) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-extrabold flex items-center gap-2">
                <Package size={16} className="text-primary" />
                بنود أصناف ومواد الفاتورة والخدمات
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addLineRow("item")}
                  className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-primary/20"
                >
                  <Plus size={14} /> إضافة صنف
                </button>
                <button
                  type="button"
                  onClick={() => addLineRow("service")}
                  className="px-3 py-1.5 bg-purple-500/10 text-purple-600 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-purple-500/20"
                >
                  <Wrench size={14} /> إضافة خدمة
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {lineItems.map((row, index) => (
                <div key={row.id} className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                      {row.type === "item" ? (
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600">صنف #{index + 1}</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-600">خدمة #{index + 1}</span>
                      )}
                    </span>
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineRow(row.id)}
                        className="text-destructive p-1 hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  {row.type === "item" ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold mb-0.5 block text-muted-foreground">صنف مخزني أو الوصف</label>
                          {availableItems.length > 0 ? (
                            <select
                              value={row.itemId ?? ""}
                              onChange={(e) => {
                                const selected = availableItems.find((x) => x.id === e.target.value);
                                updateLineItem(row.id, {
                                  itemId: e.target.value,
                                  description: selected ? selected.name : row.description,
                                  unitPrice: selected ? Number(selected.defaultPrice) : row.unitPrice,
                                });
                              }}
                              className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs"
                            >
                              <option value="">-- اختار صنف من المخزن --</option>
                              {availableItems.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name} ({Number(item.defaultPrice)} ج.م)
                                </option>
                              ))}
                            </select>
                          ) : null}
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold mb-0.5 block text-muted-foreground">تفاصيل وصف الصنف</label>
                          <input
                            type="text"
                            placeholder="مثلاً: قطاع ألومنيوم / زجاج 6mm"
                            value={row.description}
                            onChange={(e) => updateLineItem(row.id, { description: e.target.value })}
                            className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs"
                          />
                        </div>
                      </div>

                      {/* Dimensions (Length * Width * Height) & Qty & Price */}
                      <div className="grid grid-cols-5 gap-2 pt-1">
                        <div>
                          <label className="text-[10px] font-bold block text-muted-foreground">طول (L)</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="1"
                            value={row.length ?? 1}
                            onChange={(e) => updateLineItem(row.id, { length: parseFloat(e.target.value || "1") })}
                            className="w-full h-8 px-2 rounded-md border border-border bg-background text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold block text-muted-foreground">عرض (W)</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="1"
                            value={row.width ?? 1}
                            onChange={(e) => updateLineItem(row.id, { width: parseFloat(e.target.value || "1") })}
                            className="w-full h-8 px-2 rounded-md border border-border bg-background text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold block text-muted-foreground">ارتفاع (H)</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="1"
                            value={row.height ?? 1}
                            onChange={(e) => updateLineItem(row.id, { height: parseFloat(e.target.value || "1") })}
                            className="w-full h-8 px-2 rounded-md border border-border bg-background text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold block text-muted-foreground">الكمية</label>
                          <input
                            type="number"
                            placeholder="1"
                            value={row.quantity}
                            onChange={(e) => updateLineItem(row.id, { quantity: parseFloat(e.target.value || "1") })}
                            className="w-full h-8 px-2 rounded-md border border-border bg-background text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold block text-muted-foreground">السعر (ج.م)</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={row.unitPrice}
                            onChange={(e) => updateLineItem(row.id, { unitPrice: parseFloat(e.target.value || "0") })}
                            className="w-full h-8 px-2 rounded-md border border-border bg-background text-xs font-bold text-primary"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-semibold mb-0.5 block text-muted-foreground">وصف الخدمة / المصروف التشغيلي</label>
                        {availableServices.length > 0 ? (
                          <select
                            value={row.serviceId ?? ""}
                            onChange={(e) => {
                              const selected = availableServices.find((x) => x.id === e.target.value);
                              updateLineItem(row.id, {
                                serviceId: e.target.value,
                                description: selected ? selected.name : row.description,
                                unitPrice: selected ? Number(selected.defaultPrice) : row.unitPrice,
                              });
                            }}
                            className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs mb-1.5"
                          >
                            <option value="">-- اختار خدمة من القائمة أو اكتبها --</option>
                            {availableServices.map((srv) => (
                              <option key={srv.id} value={srv.id}>
                                {srv.name} ({Number(srv.defaultPrice)} ج.م)
                              </option>
                            ))}
                          </select>
                        ) : null}
                        <input
                          type="text"
                          placeholder="مثلاً: تركيب ورشة / دهان إلكتروستاتيك / نقل"
                          value={row.description}
                          onChange={(e) => updateLineItem(row.id, { description: e.target.value })}
                          className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold mb-0.5 block text-muted-foreground">سعر الخدمة (ج.م)</label>
                        <input
                          type="number"
                          placeholder="500"
                          value={row.unitPrice}
                          onChange={(e) => updateLineItem(row.id, { unitPrice: parseFloat(e.target.value || "0") })}
                          className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-bold text-purple-600"
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-left text-xs font-extrabold text-primary pt-1">
                    إجمالي البند: {row.total.toLocaleString("ar-EG")} ج.م
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
          </div>

          {/* Grand Total Preview */}
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>المبلغ قبل الضريبة:</span>
              <span className="font-bold">{computedSubtotal.toLocaleString("ar-EG")} ج.م</span>
            </div>
            {taxAmount > 0 && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>الضريبة ({form.taxPercent}%):</span>
                <span className="font-bold">{taxAmount.toLocaleString("ar-EG")} ج.م</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1 border-t border-primary/20">
              <span className="font-extrabold text-sm">إجمالي الفاتورة النهائي:</span>
              <span className="text-xl font-black text-primary">
                {grandTotal.toLocaleString("ar-EG")} ج.م
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold mb-1 block">ملاحظات وشروط الدفع والتسليم</label>
            <textarea
              rows={2}
              placeholder="شروط الدفع، ملاحظات التسليم والضمان..."
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
              {initial ? "حفظ التعديلات" : "إصدار الفاتورة التفصيلية"}
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
          <h1 className="text-2xl font-black">فواتير المبيعات والتسديد</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            إصدار فواتير مبيعات تفصيلية وحساب التكاليف والأبعاد والخدمات
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
              {search || statusFilter !== "ALL" ? "لا توجد نتائج لمعايير البحث" : "أنشئ أول فاتورة مبيعات تفصيلية الآن"}
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
