"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, RefreshCw, X, Loader2, CheckCircle,
  ChevronLeft, ChevronRight, FileText, DollarSign, Edit2,
  Clock, CheckCircle2, Trash2, Wrench, Package, Printer, Download, Percent,
} from "lucide-react";
import { toast } from "sonner";

type QuoteStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "CLOSED";

interface QuotationItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string | null;
  serviceId?: string | null;
  itemId?: string | null;
}

interface Quotation {
  id: string;
  quotationNo: string;
  status: QuoteStatus;
  subtotal: number;
  discountType?: "percentage" | "fixed" | null;
  discountValue?: number | null;
  discountAmount?: number | null;
  total: number;
  validUntil?: string | null;
  notes?: string | null;
  termsConditions?: string | null;
  createdAt: string;
  customer?: { id: string; name: string; phone?: string; taxNumber?: string } | null;
  items?: QuotationItem[];
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

interface SettingsData {
  name: string;
  logo: string;
  phone: string;
  email: string;
  address: string;
  taxNumber: string;
  commercialReg: string;
  themeColor: string;
  printNotes: string;
}

const STATUS_LABELS: Record<QuoteStatus, string> = {
  APPROVED:  "معتمد",
  PENDING:   "بانتظار الاعتماد",
  DRAFT:     "مسودة",
  CLOSED:    "مغلق",
  REJECTED:  "مرفوض",
  CANCELLED: "ملغى",
};

const STATUS_COLORS: Record<QuoteStatus, { text: string; bg: string }> = {
  APPROVED:  { text: "#10b981", bg: "#10b98118" },
  PENDING:   { text: "#f59e0b", bg: "#f59e0b18" },
  DRAFT:     { text: "#64748b", bg: "#64748b18" },
  CLOSED:    { text: "#0284c7", bg: "#0284c718" },
  REJECTED:  { text: "#ef4444", bg: "#ef444418" },
  CANCELLED: { text: "#94a3b8", bg: "#94a3b818" },
};

function isServiceItem(it: QuotationItem) {
  if (it.serviceId) return true;
  if (it.notes && (it.notes.includes("SERVICE") || it.notes.includes("خدمة"))) return true;
  if (it.description && /تركيب|دهان|نقل|صيانة|تصنيع|شحن|مصنوعية|خدمة|عمل/i.test(it.description)) return true;
  return false;
}

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
    subject: initial?.termsConditions ?? "",
    discountType: initial?.discountType ?? "fixed",
    discountValue: initial?.discountValue ? initial.discountValue.toString() : "0",
    notes: initial?.notes ?? "",
    validDays: "30",
    status: initial?.status ?? "APPROVED", // Default new quotations to APPROVED (معتمد)
  });

  const [lineItems, setLineItems] = useState<LineItemRow[]>(
    initial?.items && initial.items.length > 0
      ? initial.items.map((it, idx) => ({
          id: idx.toString(),
          type: isServiceItem(it) ? "service" : "item",
          description: it.description,
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          total: Number(it.total) || 0,
          itemId: it.itemId || undefined,
          serviceId: it.serviceId || undefined,
          length: 1,
          width: 1,
          height: 1,
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
  const [availableInvoices, setAvailableInvoices] = useState<Array<any>>([]);
  const [selectedInvId, setSelectedInvId] = useState("");
  const [fetchingData, setFetchingData] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [resC, resI, resS, resInv] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/items"),
          fetch("/api/services"),
          fetch("/api/sales/invoices"),
        ]);
        const dataC = await resC.json();
        const dataI = await resI.json();
        const dataS = await resS.json();
        const dataInv = await resInv.json();

        if (dataC.success && Array.isArray(dataC.data)) {
          setCustomers(dataC.data);
          if (!initial && dataC.data.length > 0 && !form.customerName) {
            setForm((prev) => ({ ...prev, customerName: dataC.data[0].name }));
          }
        }
        if (dataI.success && Array.isArray(dataI.data)) setAvailableItems(dataI.data);
        if (dataS.success && Array.isArray(dataS.data)) setAvailableServices(dataS.data);
        if (dataInv.success && Array.isArray(dataInv.data)) setAvailableInvoices(dataInv.data);
      } catch {
        // silent
      } finally {
        setFetchingData(false);
      }
    }
    loadData();
  }, [initial, form.customerName]);

  const handleImportInvoice = (invId: string) => {
    setSelectedInvId(invId);
    if (!invId) return;

    const inv = availableInvoices.find((i) => i.id === invId);
    if (!inv) return;

    setForm((prev) => ({
      ...prev,
      customerName: inv.customer?.name || prev.customerName,
      subject: inv.termsConditions || `عرض سعر استناداً إلى الفاتورة ${inv.invoiceNo}`,
      notes: inv.notes || prev.notes,
    }));

    if (inv.items && inv.items.length > 0) {
      setLineItems(
        inv.items.map((it: any, idx: number) => ({
          id: `${Date.now()}-${idx}`,
          type: isServiceItem(it) ? "service" : "item",
          description: it.description,
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          total: Number(it.total) || 0,
          itemId: it.itemId || undefined,
          serviceId: it.serviceId || undefined,
          length: 1,
          width: 1,
          height: 1,
        }))
      );
    }
    toast.success(`تم استدعاء بيانات الفاتورة ${inv.invoiceNo} مع إمكانية التعديل حرية تام في الأسعار`);
  };

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
  const dVal = parseFloat(form.discountValue || "0");
  const computedDiscountAmount =
    form.discountType === "percentage" ? (computedSubtotal * dVal) / 100 : dVal;
  const computedFinalTotal = Math.max(0, computedSubtotal - computedDiscountAmount);

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
          totalAmount: computedSubtotal,
          discountType: form.discountType,
          discountValue: dVal,
          notes: form.notes,
          status: form.status,
          validDays: parseInt(form.validDays || "30"),
          lineItems: lineItems.map((li) => {
            const hasDim = li.type === "item" && (li.length !== 1 || li.width !== 1 || li.height !== 1);
            const dimStr = hasDim ? `${li.length || 1} × ${li.width || 1} × ${li.height || 1} م` : "";
            return {
              description: li.description || (li.type === "item" ? "صنف" : "خدمة"),
              quantity: li.quantity,
              unitPrice: li.unitPrice,
              total: li.total,
              notes: li.type === "service" ? "SERVICE" : dimStr,
              itemId: li.type === "item" ? li.itemId : undefined,
              serviceId: li.type === "service" ? (li.serviceId || "SERVICE_MARKER") : undefined,
            };
          }),
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
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-card w-full max-w-3xl max-h-[92vh] rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border p-4 flex-shrink-0 bg-card">
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            <FileText size={20} className="text-primary" />
            {initial ? "تعديل عرض السعر" : "إنشاء عرض سعر جديد بنموذج الأصناف والخدمات والخصم"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {!initial && availableInvoices.length > 0 && (
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs font-bold text-purple-600 flex items-center gap-1.5 whitespace-nowrap">
                <FileText size={15} /> استدعاء بيانات ومواد من فاتورة مبيعات:
              </span>
              <select
                value={selectedInvId}
                onChange={(e) => handleImportInvoice(e.target.value)}
                className="w-full sm:w-auto flex-1 h-9 px-3 rounded-lg border border-purple-500/30 bg-background text-xs font-bold text-foreground focus:outline-none"
              >
                <option value="">-- اختار فاتورة لاستدعاء الأصناف والأسعار وتعديلها --</option>
                {availableInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNo} — {inv.customer?.name} ({Number(inv.total).toLocaleString("ar-EG")} ج.م)
                  </option>
                ))}
              </select>
            </div>
          )}

          <form id="quo-form" onSubmit={handleSubmit} className="space-y-4">
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
                <label className="text-xs font-bold mb-1 block">موضوع عرض السعر (مثلاً: شباك ألوميتال) *</label>
                <input
                  type="text"
                  required
                  placeholder="شباك مفصلي 120×100 / تصنيع هيكل"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Line Items Breakdown */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-sm font-extrabold flex items-center gap-2">
                  <Package size={16} className="text-primary" />
                  تفاصيل الأصناف والخدمات والمقاسات
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => addLineRow("item")}
                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-primary/20"
                  >
                    <Plus size={14} /> إضافة صنف / مادة
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
                            <label className="text-[11px] font-semibold mb-0.5 block text-muted-foreground">اختيار صنف مخزني أو الوصف</label>
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
                            <label className="text-[11px] font-semibold mb-0.5 block text-muted-foreground">اسم/وصف الصنف بالتفصيل</label>
                            <input
                              type="text"
                              placeholder="مثلاً: قطاع ألومنيوم / زجاج 6mm"
                              value={row.description}
                              onChange={(e) => updateLineItem(row.id, { description: e.target.value })}
                              className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs"
                            />
                          </div>
                        </div>

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

            {/* Discount Section */}
            <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-2">
              <span className="text-xs font-black text-rose-600 flex items-center gap-1.5">
                <Percent size={15} /> تطبيق خصم تجاري على عرض السعر:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground mb-1 block">نوع الخصم</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value as "percentage" | "fixed" })}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs font-bold"
                  >
                    <option value="fixed">مبلغ ثابت (ج.م)</option>
                    <option value="percentage">نسبة مئوية (%)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground mb-1 block">
                    {form.discountType === "percentage" ? "نسبة الخصم (%)" : "قيمة الخصم (ج.م)"}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs font-black text-rose-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold mb-1 block">حالة عرض السعر *</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as QuoteStatus })}
                  className="w-full h-10 px-3 rounded-lg border border-emerald-500/40 bg-emerald-500/5 text-sm font-bold text-emerald-700 focus:outline-none"
                >
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
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

            {/* Total Breakdown Preview */}
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>المبلغ قبل الخصم:</span>
                <span className="font-bold">{computedSubtotal.toLocaleString("ar-EG")} ج.م</span>
              </div>
              {computedDiscountAmount > 0 && (
                <div className="flex items-center justify-between text-xs text-rose-600 font-bold">
                  <span>الخصم المطبق ({form.discountType === "percentage" ? `${form.discountValue}%` : "مبلغ ثابت"}):</span>
                  <span>- {computedDiscountAmount.toLocaleString("ar-EG")} ج.م</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-primary/20">
                <span className="font-extrabold text-sm">الإجمالي النهائي لعرض السعر:</span>
                <span className="text-xl font-black text-primary">
                  {computedFinalTotal.toLocaleString("ar-EG")} ج.م
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold mb-1 block">ملاحظات وشروط التسليم</label>
              <textarea
                rows={2}
                placeholder="شروط الدفع، ملاحظات التسليم والضمان..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full p-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
              />
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-border bg-card flex gap-2 flex-shrink-0">
          <button
            type="submit"
            form="quo-form"
            disabled={loading}
            className="flex-1 h-11 bg-primary text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            {initial ? "حفظ التعديلات" : "إنشاء وحفظ عرض السعر"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 h-11 border border-border text-sm font-semibold rounded-xl"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

// 100% Centered & Fully Visible Printable Quotation Modal with Discount Breakdown
function PrintQuotationModal({
  quotation,
  onClose,
}: {
  quotation: Quotation;
  onClose: () => void;
}) {
  const [settings, setSettings] = useState<SettingsData | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.success) setSettings(data.data);
      } catch {
        // silent
      }
    }
    loadSettings();
  }, []);

  const themeColor = settings?.themeColor || "#0284c7";

  // Intelligently separate items into raw items and services
  const rawItems = quotation.items?.filter((it) => !isServiceItem(it)) ?? [];
  const serviceItems = quotation.items?.filter((it) => isServiceItem(it)) ?? [];

  const subtotal = Number(quotation.subtotal) || Number(quotation.total);
  const discountAmount = Number(quotation.discountAmount) || 0;
  const finalTotal = Number(quotation.total);

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-card w-full max-w-4xl max-h-[92vh] rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden print:max-w-none print:shadow-none print:border-none print:p-0 print:max-h-none print:h-auto">
        
        {/* Top Header */}
        <div className="bg-card border-b border-border px-4 py-3 shadow-sm flex items-center justify-between flex-shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer size={20} className="text-primary" />
            <h2 className="text-sm sm:text-base font-extrabold">
              معاينة وطباعة عرض السعر PDF
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              style={{ background: themeColor }}
              className="px-4 py-2 text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
            >
              <Download size={16} />
              <span>طباعة وحفظ كـ PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30 rounded-xl text-xs font-black flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <X size={16} />
              <span>إغلاق المعاينة</span>
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 print:border-none print:p-0 print:overflow-visible">
          {/* Company Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-5 gap-4" style={{ borderColor: `${themeColor}40` }}>
            <div className="flex items-center gap-3">
              {settings?.logo ? (
                <img src={settings.logo} alt="Logo" className="w-14 h-14 object-contain rounded-xl" />
              ) : (
                <div style={{ background: themeColor }} className="w-14 h-14 rounded-2xl text-white font-black text-xl flex items-center justify-center">
                  {settings?.name?.[0] || "ش"}
                </div>
              )}
              <div>
                <h3 className="text-lg sm:text-xl font-black" style={{ color: themeColor }}>
                  {settings?.name || "المقر الرئيسي"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {settings?.phone && `هاتف: ${settings.phone} • `}
                  {settings?.taxNumber && `الرقم الضريبي: ${settings.taxNumber}`}
                </p>
                {settings?.address && <p className="text-xs text-muted-foreground">{settings.address}</p>}
              </div>
            </div>

            <div className="sm:text-left">
              <span style={{ background: themeColor }} className="px-3 py-1 text-xs font-black text-white rounded-lg inline-block mb-1">
                عرض سعر (Quotation)
              </span>
              <p className="text-sm font-mono font-bold">{quotation.quotationNo}</p>
              <p className="text-xs text-muted-foreground">التاريخ: {new Date(quotation.createdAt).toLocaleDateString("ar-EG")}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-4 rounded-xl bg-muted/20 border border-border flex flex-col sm:flex-row justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-muted-foreground block">مقدم إلى العميل:</span>
              <p className="text-base font-black">{quotation.customer?.name || "—"}</p>
              {quotation.customer?.phone && <p className="text-xs text-muted-foreground">الهاتف: {quotation.customer.phone}</p>}
            </div>
            {quotation.termsConditions && (
              <div className="sm:text-left">
                <span className="text-xs font-bold text-muted-foreground block">موضوع العرض:</span>
                <p className="text-sm font-bold">{quotation.termsConditions}</p>
              </div>
            )}
          </div>

          {/* SECTION 1: ITEMS TABLE */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold flex items-center gap-1.5 text-primary">
              <Package size={15} /> أولاً: بنود الأصناف والمواد المستخدمة (مع الأبعاد L × W × H)
            </h4>
            <div className="border border-border rounded-xl overflow-x-auto">
              <table className="w-full text-right text-xs min-w-[500px]">
                <thead>
                  <tr style={{ background: `${themeColor}15`, color: themeColor }} className="border-b border-border font-bold">
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">اسم/وصف الصنف والمواصفات</th>
                    <th className="p-2.5">الأبعاد (طول × عرض × ارتفاع)</th>
                    <th className="p-2.5">الكمية</th>
                    <th className="p-2.5">السعر الفردي</th>
                    <th className="p-2.5">الإجمالي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rawItems.length > 0 ? (
                    rawItems.map((it, idx) => {
                      const dimText =
                        it.notes && !it.notes.includes("SERVICE")
                          ? it.notes
                          : it.description.match(/\d+(\.\d+)?\s*×\s*\d+(\.\d+)?(\s*×\s*\d+(\.\d+)?)?/)?.[0] ?? "1 × 1 × 1 م";
                      return (
                        <tr key={idx}>
                          <td className="p-2.5 font-bold">{idx + 1}</td>
                          <td className="p-2.5 font-bold">{it.description}</td>
                          <td className="p-2.5 font-bold text-primary">{dimText}</td>
                          <td className="p-2.5 font-semibold">{Number(it.quantity)}</td>
                          <td className="p-2.5 font-semibold">{Number(it.unitPrice).toLocaleString("ar-EG")} ج.م</td>
                          <td className="p-2.5 font-black text-primary">{Number(it.total).toLocaleString("ar-EG")} ج.م</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td className="p-2.5 font-bold">1</td>
                      <td className="p-2.5 font-bold">{quotation.termsConditions || "تصنيع وتجهيز خامات ورشة"}</td>
                      <td className="p-2.5 font-bold text-primary">—</td>
                      <td className="p-2.5 font-semibold">1</td>
                      <td className="p-2.5 font-semibold">{Number(quotation.total).toLocaleString("ar-EG")} ج.م</td>
                      <td className="p-2.5 font-black text-primary">{Number(quotation.total).toLocaleString("ar-EG")} ج.م</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: SERVICES TABLE */}
          {serviceItems.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-extrabold flex items-center gap-1.5 text-purple-600">
                <Wrench size={15} /> ثانياً: بنود الخدمات وأعمال التشغيل والتركيب
              </h4>
              <div className="border border-border rounded-xl overflow-x-auto">
                <table className="w-full text-right text-xs min-w-[400px]">
                  <thead>
                    <tr className="bg-purple-500/10 text-purple-700 border-b border-border font-bold">
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">وصف الخدمة / المصروف التشغيلي</th>
                      <th className="p-2.5">سعر الخدمة</th>
                      <th className="p-2.5">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {serviceItems.map((srv, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold">{idx + 1}</td>
                        <td className="p-2.5 font-bold">{srv.description}</td>
                        <td className="p-2.5 font-semibold">{Number(srv.unitPrice).toLocaleString("ar-EG")} ج.م</td>
                        <td className="p-2.5 font-black text-purple-600">{Number(srv.total).toLocaleString("ar-EG")} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Grand Total Breakdown with Discount */}
          <div className="flex justify-end pt-2">
            <div className="p-4 rounded-xl border border-border bg-muted/20 w-full sm:w-80 space-y-1.5 text-right">
              {discountAmount > 0 && (
                <>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>المبلغ قبل الخصم:</span>
                    <span className="font-bold">{subtotal.toLocaleString("ar-EG")} ج.م</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-rose-600 font-bold">
                    <span>الخصم التجاري المطبق:</span>
                    <span>- {discountAmount.toLocaleString("ar-EG")} ج.م</span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <span className="text-xs font-bold text-muted-foreground">إجمالي عرض السعر النهائي:</span>
                <span className="text-2xl font-black" style={{ color: themeColor }}>
                  {finalTotal.toLocaleString("ar-EG")} ج.م
                </span>
              </div>
            </div>
          </div>

          {/* Print Footer / Terms & Bank Info */}
          {(quotation.notes || settings?.printNotes) && (
            <div className="p-4 rounded-xl bg-muted/10 border border-border text-xs space-y-1">
              <span className="font-bold text-muted-foreground block">شروط وأحكام العرض والحسابات البنكية:</span>
              <p className="whitespace-pre-line text-muted-foreground">{quotation.notes || settings?.printNotes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border bg-card p-3 flex items-center justify-between gap-3 flex-shrink-0 print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-muted text-foreground border border-border hover:bg-muted/80 rounded-xl text-xs font-black flex items-center gap-1.5 active:scale-95 transition-transform"
          >
            <X size={16} /> إغلاق المعاينة
          </button>
          <button
            onClick={() => window.print()}
            style={{ background: themeColor }}
            className="px-6 py-2.5 text-white text-xs font-black rounded-xl flex items-center gap-2 shadow-lg active:scale-95 transition-transform"
          >
            <Download size={16} /> طباعة وحفظ كـ PDF
          </button>
        </div>

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
  const [printingQuotation, setPrintingQuotation] = useState<Quotation | null>(null);
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

  const handleQuickStatusChange = async (quoId: string, newStatus: QuoteStatus) => {
    try {
      const res = await fetch(`/api/sales/quotations/${quoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`تم تغيير حالة عرض السعر إلى: ${STATUS_LABELS[newStatus]}`);
        setQuotations((prev) =>
          prev.map((q) => (q.id === quoId ? { ...q, status: newStatus } : q))
        );
      } else {
        toast.error(data.message || "فشل تغيير الحالة");
      }
    } catch {
      toast.error("تعذر الاتصال بالخادم");
    }
  };

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
          <h1 className="text-2xl font-black">عروض الأسعار والتسعير التفصيلي</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            إنشاء وطباعة عروض أسعار تفصيلية بجداول مستقلة للأصناف والخدمات والخصومات التجاري وحفظ كـ PDF
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
              {search || statusFilter !== "ALL" ? "لا توجد نتائج لمعايير البحث" : "أنشئ أول عرض سعر تفصيلي للعميل"}
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
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">الإجمالي النهائي</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs hidden md:table-cell">الخصم</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">الحالة (انقر للتعديل)</th>
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
                    const disc = Number(q.discountAmount) || 0;
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
                        <td className="p-3.5 font-extrabold text-primary">
                          {Number(q.total).toLocaleString("ar-EG")} ج.م
                        </td>
                        <td className="p-3.5 hidden md:table-cell text-xs font-bold text-rose-600">
                          {disc > 0 ? `-${disc.toLocaleString("ar-EG")} ج.م` : "—"}
                        </td>
                        <td className="p-3.5">
                          <select
                            value={q.status}
                            onChange={(e) => handleQuickStatusChange(q.id, e.target.value as QuoteStatus)}
                            style={{ color: sc.text, background: sc.bg }}
                            className="px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer border-none focus:outline-none"
                            title="انقر لتغيير حالة عرض السعر مباشرة"
                          >
                            {Object.entries(STATUS_LABELS).map(([k, v]) => (
                              <option key={k} value={k} className="bg-background text-foreground">
                                {v}
                              </option>
                            ))}
                          </select>
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
                          <div className="flex items-center gap-1">
                            <a
                              href={`/sales/invoices?quoId=${q.id}`}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-xs font-bold flex items-center gap-1"
                              title="تحويل عرض السعر إلى فاتورة مبيعات"
                            >
                              <FileText size={13} />
                              <span>تحويل لفاتورة</span>
                            </a>
                            <button
                              onClick={() => setPrintingQuotation(q)}
                              className="p-2 rounded-lg hover:bg-muted text-primary hover:text-primary/80"
                              title="طباعة وحفظ كـ PDF باللوجو والثيم"
                            >
                              <Printer size={15} />
                            </button>
                            <button
                              onClick={() => { setEditingQuotation(q); setShowModal(true); }}
                              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                              title="تعديل"
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
        <QuotationModal
          onClose={() => { setShowModal(false); setEditingQuotation(null); }}
          onSave={handleSave}
          initial={editingQuotation}
        />
      )}

      {printingQuotation && (
        <PrintQuotationModal
          quotation={printingQuotation}
          onClose={() => setPrintingQuotation(null)}
        />
      )}
    </div>
  );
}
