"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, RefreshCw, X, Loader2, CheckCircle,
  ChevronLeft, ChevronRight, Boxes, DollarSign, Edit2,
  Package, ShoppingCart, Eye, ArrowUpRight, ArrowDownRight,
  Truck, CreditCard, Calendar, User, FileText, BarChart2,
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

interface Supplier {
  id: string;
  name: string;
  phone?: string | null;
}

interface ItemCardData {
  item: {
    id: string;
    name: string;
    code?: string | null;
    defaultCost: number;
    defaultPrice: number;
  };
  purchases: Array<{
    id: string;
    date: string;
    invoiceNo: string;
    supplierName: string;
    quantity: number;
    unitPrice: number;
    total: number;
    status: string;
  }>;
  sales: Array<{
    id: string;
    date: string;
    invoiceNo: string;
    customerName: string;
    quantity: number;
    unitPrice: number;
    total: number;
    status: string;
  }>;
  summary: {
    totalPurchasedQty: number;
    totalSoldQty: number;
    remainingStock: number;
    purchaseCount: number;
    salesCount: number;
  };
}

// ─── Modal 1: Item Definition (تعريف صنف) ──────────────────────────
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

      toast.success(initial ? "تم تحديث بيانات الصنف" : "تم تعريف وحفظ الصنف بنجاح");
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
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            <Package size={20} className="text-primary" />
            {initial ? "تعديل الصنف" : "تعريف صنف مخزني جديد"}
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
              placeholder="مثال: شباك مفصلي 100×120 سم أو ألومنيوم قطاع 45"
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
                placeholder="ITM-001"
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
              <label className="text-xs font-bold mb-1 block">سعر التكلفة الافتراضي (ج.م)</label>
              <input
                type="number"
                placeholder="500"
                value={form.costPrice}
                onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold mb-1 block">سعر البيع الافتراضي (ج.م)</label>
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

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 bg-primary text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              {initial ? "حفظ التعديلات" : "حفظ وتعريف الصنف"}
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

// ─── Modal 2: View Item Card (عرض كارت الصنف) ─────────────────────
function ItemCardModal({
  itemId,
  onClose,
}: {
  itemId: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<ItemCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"purchases" | "sales">("purchases");

  useEffect(() => {
    async function loadCard() {
      try {
        const res = await fetch(`/api/items/${itemId}/card`);
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch {
        toast.error("فشل جلب بيانات كارت الصنف");
      } finally {
        setLoading(false);
      }
    }
    loadCard();
  }, [itemId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-4xl rounded-2xl border border-border shadow-xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Eye size={20} className="text-primary" />
            <h2 className="text-lg font-black">
              كارت الصنف التفصيلي {data ? `— ${data.item.name}` : ""}
            </h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : !data ? (
          <div className="text-center py-12 text-muted-foreground">تعذر تحميل بيانات كارت الصنف</div>
        ) : (
          <div className="space-y-5">
            {/* Stock Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                <span className="text-xs text-purple-700 font-bold block">إجمالي الكميات المشترَاة</span>
                <p className="text-2xl font-black text-purple-700">{data.summary.totalPurchasedQty.toLocaleString("ar-EG")}</p>
                <span className="text-[11px] text-purple-600 font-semibold">{data.summary.purchaseCount} عمليّة شراء من الموردين</span>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                <span className="text-xs text-blue-700 font-bold block">إجمالي الكميات المباعة</span>
                <p className="text-2xl font-black text-blue-700">{data.summary.totalSoldQty.toLocaleString("ar-EG")}</p>
                <span className="text-[11px] text-blue-600 font-semibold">{data.summary.salesCount} عمليّة بيع للعملاء</span>
              </div>

              <div className={`p-4 rounded-xl border space-y-1 ${data.summary.remainingStock >= 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"}`}>
                <span className={`text-xs font-bold block ${data.summary.remainingStock >= 0 ? "text-emerald-700" : "text-rose-700"}`}>الرصيد المتبقي بالمخزن</span>
                <p className={`text-2xl font-black ${data.summary.remainingStock >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  {data.summary.remainingStock.toLocaleString("ar-EG")}
                </p>
                <span className={`text-[11px] font-semibold ${data.summary.remainingStock >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {data.summary.remainingStock >= 0 ? "متوفر بالمخزن" : "عجز بالمخزن"}
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setActiveTab("purchases")}
                className={`pb-2.5 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === "purchases"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Truck size={16} />
                حركات الشراء ({data.purchases.length})
              </button>
              <button
                onClick={() => setActiveTab("sales")}
                className={`pb-2.5 px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === "sales"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <ShoppingCart size={16} />
                حركات المبيعات ({data.sales.length})
              </button>
            </div>

            {/* Tab 1: Purchases */}
            {activeTab === "purchases" && (
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-muted/60 border-b border-border">
                      <th className="p-3 font-bold">التاريخ</th>
                      <th className="p-3 font-bold">المورد</th>
                      <th className="p-3 font-bold">رقم الفاتورة</th>
                      <th className="p-3 font-bold">الكمية</th>
                      <th className="p-3 font-bold">سعر الشراء</th>
                      <th className="p-3 font-bold">إجمالي المبلغ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.purchases.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-muted-foreground">
                          لم يتم شراء هذا الصنف بعد
                        </td>
                      </tr>
                    ) : (
                      data.purchases.map((p) => (
                        <tr key={p.id} className="hover:bg-muted/10">
                          <td className="p-3 whitespace-nowrap">{new Date(p.date).toLocaleDateString("ar-EG")}</td>
                          <td className="p-3 font-bold">{p.supplierName}</td>
                          <td className="p-3 font-mono font-semibold text-purple-600">{p.invoiceNo}</td>
                          <td className="p-3 font-black text-emerald-600">{p.quantity}</td>
                          <td className="p-3 font-semibold">{p.unitPrice.toLocaleString("ar-EG")} ج.م</td>
                          <td className="p-3 font-black">{p.total.toLocaleString("ar-EG")} ج.م</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 2: Sales */}
            {activeTab === "sales" && (
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-muted/60 border-b border-border">
                      <th className="p-3 font-bold">التاريخ</th>
                      <th className="p-3 font-bold">العميل</th>
                      <th className="p-3 font-bold">رقم الفاتورة</th>
                      <th className="p-3 font-bold">الكمية المباعة</th>
                      <th className="p-3 font-bold">سعر البيع</th>
                      <th className="p-3 font-bold">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.sales.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-muted-foreground">
                          لم يتم بيع هذا الصنف بعد
                        </td>
                      </tr>
                    ) : (
                      data.sales.map((s) => (
                        <tr key={s.id} className="hover:bg-muted/10">
                          <td className="p-3 whitespace-nowrap">{new Date(s.date).toLocaleDateString("ar-EG")}</td>
                          <td className="p-3 font-bold">{s.customerName}</td>
                          <td className="p-3 font-mono font-semibold text-blue-600">{s.invoiceNo}</td>
                          <td className="p-3 font-black text-blue-600">{s.quantity}</td>
                          <td className="p-3 font-semibold">{s.unitPrice.toLocaleString("ar-EG")} ج.م</td>
                          <td className="p-3 font-black">{s.total.toLocaleString("ar-EG")} ج.م</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Modal 3: Re-Purchase Item (إعادة شراء) ───────────────────────
function ItemRepurchaseModal({
  item,
  onClose,
  onSuccess,
}: {
  item: Item;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState(item.defaultCost?.toString() ?? "0");
  const [paymentType, setPaymentType] = useState<"CREDIT" | "CASH">("CREDIT");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingSuppliers, setFetchingSuppliers] = useState(true);

  useEffect(() => {
    async function loadSuppliers() {
      try {
        const res = await fetch("/api/suppliers");
        const json = await res.json();
        if (json.success) setSuppliers(json.data ?? []);
      } catch {
        toast.error("فشل تحميل الموردين");
      } finally {
        setFetchingSuppliers(false);
      }
    }
    loadSuppliers();
  }, []);

  const totalAmount = (parseFloat(quantity || "0") * parseFloat(unitPrice || "0")) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return toast.error("يرجى اختيار المورد");
    if (!quantity || parseFloat(quantity) <= 0) return toast.error("الكمية يجب أن تكون أكبر من 0");

    setLoading(true);
    try {
      const res = await fetch(`/api/items/${item.id}/repurchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId,
          quantity: parseFloat(quantity),
          unitPrice: parseFloat(unitPrice || "0"),
          paymentType,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok) return toast.error(json.message || "حدث خطأ أثناء الشراء");

      toast.success(json.message || "تم تسجيل حركة إعادة الشراء بنجاح");
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
      <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base font-extrabold flex items-center gap-2">
            <ShoppingCart size={18} className="text-purple-600" />
            إعادة شراء صنف — {item.name}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold mb-1 block">اختر المورد *</label>
            {fetchingSuppliers ? (
              <div className="h-10 bg-muted/30 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                <Loader2 size={16} className="animate-spin ml-2" /> جارٍ تحميل الموردين...
              </div>
            ) : (
              <select
                required
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
              >
                <option value="">-- حدد المورد الذي سشتري منه --</option>
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name} {sup.phone ? `(${sup.phone})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold mb-1 block">الكمية المشترَاة *</label>
              <input
                type="number"
                required
                step="0.01"
                min="0.01"
                placeholder="10"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold mb-1 block">سعر الفردي الشراء (ج.م) *</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                placeholder="500"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Payment Terms Selector (شراء بالأجل / الدفع مع الشراء) */}
          <div>
            <label className="text-xs font-bold mb-1.5 block">طريقة السداد والتسجيل بكشف المورد *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentType("CREDIT")}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-colors ${
                  paymentType === "CREDIT"
                    ? "border-amber-500 bg-amber-500/10 text-amber-700"
                    : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <CreditCard size={18} />
                <span>شراء بالأجل (آجل)</span>
                <span className="text-[10px] font-normal opacity-80">ينزل حركة مشتريات فقط بكشف الحساب</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType("CASH")}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-colors ${
                  paymentType === "CASH"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                    : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <CheckCircle size={18} />
                <span>الدفع مع الشراء (نقدي)</span>
                <span className="text-[10px] font-normal opacity-80">ينزل سطر للمشتريات وسطر للسداد بكشف الحساب</span>
              </button>
            </div>
          </div>

          {/* Total Summary */}
          <div className="p-3 rounded-xl bg-muted/30 border border-border flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">إجمالي قيمة الفاتورة الشراء:</span>
            <span className="text-lg font-black text-primary">{totalAmount.toLocaleString("ar-EG")} ج.م</span>
          </div>

          <div>
            <label className="text-xs font-bold mb-1 block">ملاحظات الشراء</label>
            <textarea
              rows={2}
              placeholder="ملاحظات توريد، رقم المرجع..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 bg-purple-600 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md shadow-purple-600/20"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
              تأكيد إضافة الشراء للمخزن
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

// ─── Main Items Page Component ─────────────────────────────────────
export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  
  // Modals for Item Card & Re-purchase
  const [cardItemId, setCardItemId] = useState<string | null>(null);
  const [repurchaseItem, setRepurchaseItem] = useState<Item | null>(null);

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
      {/* Header with "تعريف صنف" Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">تعريف وإدارة الأصناف والمخزن</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            تعريف الأنماط والمواد الخامات، عرض كارت الصنف للحركات، وإعادة الشراء المباشر من الموردين
          </p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm active:scale-95 transition-transform shadow-md shadow-primary/20"
        >
          <Plus size={18} />
          <span>تعريف صنف جديد</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "إجمالي الأصناف المعرَّفة",
            value: items.length.toString(),
            icon: Boxes,
            color: "#7c3aed",
          },
          {
            label: "الأصناف النشطة بالمخزن",
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

      {/* Items Grid & Search */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border">
          <div className="relative flex-1">
            <Search size={16} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو كود الصنف..."
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
            <span className="hidden sm:inline">تحديث الجريد</span>
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
            <h3 className="font-bold text-base mb-1">لا توجد أصناف معرفة</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              {search ? "لا توجد نتائج لبحثك" : "اضغط على زر (تعريف صنف) لبدء تعريف منتجاتك وخاماتك"}
            </p>
            {!search && (
              <button
                onClick={() => { setEditingItem(null); setShowModal(true); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm"
              >
                <Plus size={16} />
                تعريف صنف جديد
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">الصنف المعرَّف</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs hidden sm:table-cell">الكود</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">سعر التكلفة</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">سعر البيع</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs">الحالة</th>
                    <th className="p-3.5 font-bold text-muted-foreground text-xs text-center">إجراءات كارت الصنف وإعادة الشراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginated.map((item) => {
                    const cost = item.defaultCost || 0;
                    const price = item.defaultPrice || 0;
                    return (
                      <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                              <Package size={18} />
                            </div>
                            <div>
                              <p className="font-bold">{item.name}</p>
                            </div>
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
                        <td className="p-3.5">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                            item.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                          }`}>
                            {item.isActive ? "نشط" : "موقوف"}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center justify-center gap-2">
                            {/* Button 1: View Item Card (عرض كارت الصنف) */}
                            <button
                              onClick={() => setCardItemId(item.id)}
                              className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
                              title="عرض حركة المبيعات والمشتريات والرصيد المتبقي"
                            >
                              <Eye size={14} />
                              <span>عرض كارت الصنف</span>
                            </button>

                            {/* Button 2: Re-Purchase (إعادة شراء) */}
                            <button
                              onClick={() => setRepurchaseItem(item)}
                              className="px-3 py-1.5 bg-purple-600/10 text-purple-700 hover:bg-purple-600/20 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
                              title="إعادة شراء الصنف واختيار طريقة الدفع نقدية أو بالأجل للمورد"
                            >
                              <ShoppingCart size={14} />
                              <span>إعادة شراء</span>
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => { setEditingItem(item); setShowModal(true); }}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                              title="تعديل بيانات الصنف"
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

      {/* Modal 1: Define / Edit Item */}
      {showModal && (
        <ItemModal
          onClose={() => { setShowModal(false); setEditingItem(null); }}
          onSave={handleSave}
          initial={editingItem}
        />
      )}

      {/* Modal 2: View Item Card */}
      {cardItemId && (
        <ItemCardModal
          itemId={cardItemId}
          onClose={() => setCardItemId(null)}
        />
      )}

      {/* Modal 3: Re-Purchase Item */}
      {repurchaseItem && (
        <ItemRepurchaseModal
          item={repurchaseItem}
          onClose={() => setRepurchaseItem(null)}
          onSuccess={fetchItems}
        />
      )}
    </div>
  );
}
