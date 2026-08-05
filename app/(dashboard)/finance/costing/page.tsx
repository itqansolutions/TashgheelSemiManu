"use client";

import { useState, useEffect } from "react";
import {
  Calculator, DollarSign, Package, Wrench, Plus, Trash2,
  TrendingUp, Percent, Printer, RefreshCw, FileText, CheckCircle2,
  Sliders, ArrowUpRight, ChevronRight, Layers, PieChart,
} from "lucide-react";
import { toast } from "sonner";
import PrintPortal from "@/components/global/PrintPortal";

interface RawMaterialRow {
  id: string;
  itemId?: string;
  name: string;
  quantity: number;
  unitCost: number;
}

interface ServiceLaborRow {
  id: string;
  serviceId?: string;
  name: string;
  quantity: number;
  unitCost: number;
}

interface ItemOption {
  id: string;
  name: string;
  defaultCost: number;
}

interface ServiceOption {
  id: string;
  name: string;
  defaultCost: number;
}

export default function CostingPage() {
  const [jobTitle, setJobTitle] = useState("تسعير نموذج تشغيل / منتج تصنيعي");
  const [itemsOptions, setItemsOptions] = useState<ItemOption[]>([]);
  const [servicesOptions, setServicesOptions] = useState<ServiceOption[]>([]);

  // Cost Breakdown Items
  const [materials, setMaterials] = useState<RawMaterialRow[]>([
    { id: "1", name: "حديد قطاع / خامة رئيسية", quantity: 2, unitCost: 450 },
  ]);
  const [services, setServices] = useState<ServiceLaborRow[]>([
    { id: "1", name: "مصنوعية دهان وتجهيز ورشة", quantity: 1, unitCost: 300 },
  ]);

  // Overheads & Margin
  const [wastePercent, setWastePercent] = useState<number>(5); // 5% هالك خامات
  const [overheadPercent, setOverheadPercent] = useState<number>(10); // 10% مصاريف تشغيل وإدارية
  const [profitMarginPercent, setProfitMarginPercent] = useState<number>(25); // 25% هامش ربح

  const [showPrintModal, setShowPrintModal] = useState(false);

  // Fetch items & services for dropdown selectors
  useEffect(() => {
    async function loadData() {
      try {
        const [resItems, resServices] = await Promise.all([
          fetch("/api/items"),
          fetch("/api/services"),
        ]);
        const dataItems = await resItems.json();
        const dataServices = await resServices.json();

        if (dataItems.success) setItemsOptions(dataItems.data ?? []);
        if (dataServices.success) setServicesOptions(dataServices.data ?? []);
      } catch {
        // silent
      }
    }
    loadData();
  }, []);

  // Material Handlers
  const addMaterialRow = () => {
    setMaterials((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "خامة جديدة", quantity: 1, unitCost: 0 },
    ]);
  };

  const removeMaterialRow = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMaterialRow = (id: string, field: keyof RawMaterialRow, value: any) => {
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const selectItemForMaterial = (id: string, itemId: string) => {
    const selected = itemsOptions.find((i) => i.id === itemId);
    if (selected) {
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, itemId: selected.id, name: selected.name, unitCost: Number(selected.defaultCost || 0) }
            : m
        )
      );
    }
  };

  // Service Handlers
  const addServiceRow = () => {
    setServices((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "خدمة / مصروف تشغيلي", quantity: 1, unitCost: 0 },
    ]);
  };

  const removeServiceRow = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const updateServiceRow = (id: string, field: keyof ServiceLaborRow, value: any) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const selectServiceForLabor = (id: string, serviceId: string) => {
    const selected = servicesOptions.find((s) => s.id === serviceId);
    if (selected) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, serviceId: selected.id, name: selected.name, unitCost: Number(selected.defaultCost || 0) }
            : s
        )
      );
    }
  };

  // Cost Calculations
  const rawMaterialsTotal = materials.reduce((acc, m) => acc + (m.quantity * m.unitCost || 0), 0);
  const servicesTotal = services.reduce((acc, s) => acc + (s.quantity * s.unitCost || 0), 0);

  const directCost = rawMaterialsTotal + servicesTotal;
  const wasteAmount = (rawMaterialsTotal * (wastePercent || 0)) / 100;
  const overheadAmount = (directCost * (overheadPercent || 0)) / 100;

  const totalNetCost = directCost + wasteAmount + overheadAmount; // إجمالي التكلفة الإجمالية الحقيقية
  const profitAmount = (totalNetCost * (profitMarginPercent || 0)) / 100;
  const suggestedSellingPrice = totalNetCost + profitAmount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Calculator size={26} className="text-primary" />
            حاسبة وتكاليف التصنيع والخدمات
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            حساب تكاليف الخامات والمصنوعية وتحديد هامش الربح وسعر البيع المقترح لأوامر التشغيل
          </p>
        </div>
        <button
          onClick={() => setShowPrintModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform"
        >
          <Printer size={18} />
          <span>طباعة كارت حساب التكلفة</span>
        </button>
      </div>

      {/* Main Form & Live Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Cost Inputs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Job Title Input */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <label className="text-xs font-bold text-muted-foreground block">عنوان أو اسم المنتج المراد تسعيره</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-border bg-background text-base font-extrabold text-primary focus:outline-none"
              placeholder="مثال: تسعير باب شقة مصفح 100×210 سم"
            />
          </div>

          {/* Section 1: Raw Materials (الخامات) */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-extrabold flex items-center gap-2 text-amber-600">
                <Package size={18} /> أولاً: تكلفة الخامات والمواد المستهلكة
              </h2>
              <button
                type="button"
                onClick={addMaterialRow}
                className="px-3 py-1.5 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Plus size={14} /> إضافة خامة
              </button>
            </div>

            <div className="space-y-3">
              {materials.map((m) => (
                <div key={m.id} className="grid grid-cols-12 gap-2 items-center bg-muted/20 p-2.5 rounded-xl border border-border">
                  <div className="col-span-5 sm:col-span-4 space-y-1">
                    <select
                      value={m.itemId || ""}
                      onChange={(e) => selectItemForMaterial(m.id, e.target.value)}
                      className="w-full h-9 px-2 text-xs rounded-lg border border-border bg-background font-semibold focus:outline-none mb-1"
                    >
                      <option value="">-- اختر من مخزن الخامات --</option>
                      {itemsOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name} ({opt.defaultCost} ج.م)
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="اسم الخامة..."
                      value={m.name}
                      onChange={(e) => updateMaterialRow(m.id, "name", e.target.value)}
                      className="w-full h-8 px-2.5 text-xs font-bold rounded-lg border border-border bg-background focus:outline-none"
                    />
                  </div>

                  <div className="col-span-3 sm:col-span-3">
                    <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">الكمية</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={m.quantity}
                      onChange={(e) => updateMaterialRow(m.id, "quantity", parseFloat(e.target.value || "0"))}
                      className="w-full h-8 px-2 text-xs font-bold text-center rounded-lg border border-border bg-background focus:outline-none"
                    />
                  </div>

                  <div className="col-span-3 sm:col-span-4">
                    <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">سعر التكلفة (ج.م)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={m.unitCost}
                      onChange={(e) => updateMaterialRow(m.id, "unitCost", parseFloat(e.target.value || "0"))}
                      className="w-full h-8 px-2 text-xs font-bold text-center rounded-lg border border-border bg-background focus:outline-none"
                    />
                  </div>

                  <div className="col-span-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => removeMaterialRow(m.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <span className="text-xs font-extrabold text-amber-700">
                إجمالي الخامات: {rawMaterialsTotal.toLocaleString("ar-EG")} ج.م
              </span>
            </div>
          </div>

          {/* Section 2: Services & Labor (الخدمات والمصنوعية) */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-base font-extrabold flex items-center gap-2 text-purple-600">
                <Wrench size={18} /> ثانياً: تكلفة المصنوعية والخدمات التشغيلية
              </h2>
              <button
                type="button"
                onClick={addServiceRow}
                className="px-3 py-1.5 bg-purple-500/10 text-purple-700 hover:bg-purple-500/20 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Plus size={14} /> إضافة خدمة
              </button>
            </div>

            <div className="space-y-3">
              {services.map((s) => (
                <div key={s.id} className="grid grid-cols-12 gap-2 items-center bg-muted/20 p-2.5 rounded-xl border border-border">
                  <div className="col-span-5 sm:col-span-4 space-y-1">
                    <select
                      value={s.serviceId || ""}
                      onChange={(e) => selectServiceForLabor(s.id, e.target.value)}
                      className="w-full h-9 px-2 text-xs rounded-lg border border-border bg-background font-semibold focus:outline-none mb-1"
                    >
                      <option value="">-- اختر من قائمة الخدمات --</option>
                      {servicesOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name} ({opt.defaultCost} ج.م)
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="وصف الخدمة..."
                      value={s.name}
                      onChange={(e) => updateServiceRow(s.id, "name", e.target.value)}
                      className="w-full h-8 px-2.5 text-xs font-bold rounded-lg border border-border bg-background focus:outline-none"
                    />
                  </div>

                  <div className="col-span-3 sm:col-span-3">
                    <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">الكمية / التكرار</label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={s.quantity}
                      onChange={(e) => updateServiceRow(s.id, "quantity", parseFloat(e.target.value || "0"))}
                      className="w-full h-8 px-2 text-xs font-bold text-center rounded-lg border border-border bg-background focus:outline-none"
                    />
                  </div>

                  <div className="col-span-3 sm:col-span-4">
                    <label className="text-[10px] font-bold text-muted-foreground block mb-0.5">تكلفة الخدمة (ج.م)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={s.unitCost}
                      onChange={(e) => updateServiceRow(s.id, "unitCost", parseFloat(e.target.value || "0"))}
                      className="w-full h-8 px-2 text-xs font-bold text-center rounded-lg border border-border bg-background focus:outline-none"
                    />
                  </div>

                  <div className="col-span-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => removeServiceRow(s.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <span className="text-xs font-extrabold text-purple-700">
                إجمالي المصنوعية والخدمات: {servicesTotal.toLocaleString("ar-EG")} ج.م
              </span>
            </div>
          </div>

          {/* Section 3: Overhead & Waste Margins */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h2 className="text-base font-extrabold flex items-center gap-2 text-blue-600 border-b border-border pb-3">
              <Sliders size={18} /> ثالثاً: نسب الهالك والمصاريف التشغيلية والأرباح
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold mb-1 block">نسبة هالك الفاقد بالخامات (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={wastePercent}
                  onChange={(e) => setWastePercent(parseFloat(e.target.value || "0"))}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm font-bold text-center focus:outline-none"
                />
                <span className="text-[11px] text-muted-foreground block mt-1">
                  قيمة الهالك: {wasteAmount.toLocaleString("ar-EG")} ج.م
                </span>
              </div>

              <div>
                <label className="text-xs font-bold mb-1 block">المصاريف الإدارية والتشغيل (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={overheadPercent}
                  onChange={(e) => setOverheadPercent(parseFloat(e.target.value || "0"))}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm font-bold text-center focus:outline-none"
                />
                <span className="text-[11px] text-muted-foreground block mt-1">
                  قيمة المصاريف: {overheadAmount.toLocaleString("ar-EG")} ج.م
                </span>
              </div>

              <div>
                <label className="text-xs font-bold mb-1 block text-emerald-600">هامش الربح المستهدف (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={profitMarginPercent}
                  onChange={(e) => setProfitMarginPercent(parseFloat(e.target.value || "0"))}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <span className="text-[11px] text-emerald-600 font-bold block mt-1">
                  مبلغ الربح: {profitAmount.toLocaleString("ar-EG")} ج.م
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Live Summary Card */}
        <div className="space-y-6">
          <div className="bg-card border-2 border-primary/20 rounded-2xl p-6 space-y-5 sticky top-24 shadow-xl">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <PieChart size={22} className="text-primary" />
              <h2 className="text-lg font-black text-primary">ملخص دراسة التكلفة</h2>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>تكلفة الخامات:</span>
                <span className="font-bold text-foreground">{rawMaterialsTotal.toLocaleString("ar-EG")} ج.م</span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground">
                <span>تكلفة المصنوعية والخدمات:</span>
                <span className="font-bold text-foreground">{servicesTotal.toLocaleString("ar-EG")} ج.م</span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground">
                <span>الهالك والفاقد ({wastePercent}%):</span>
                <span className="font-bold text-foreground">{wasteAmount.toLocaleString("ar-EG")} ج.م</span>
              </div>

              <div className="flex items-center justify-between text-muted-foreground">
                <span>المصاريف الإدارية ({overheadPercent}%):</span>
                <span className="font-bold text-foreground">{overheadAmount.toLocaleString("ar-EG")} ج.م</span>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-sm">
                <span className="font-extrabold text-foreground">إجمالي التكلفة الإجمالية:</span>
                <span className="font-black text-rose-600">{totalNetCost.toLocaleString("ar-EG")} ج.م</span>
              </div>

              <div className="flex items-center justify-between text-xs text-emerald-600 font-bold">
                <span>صافي الربح المستهدف ({profitMarginPercent}%):</span>
                <span>+ {profitAmount.toLocaleString("ar-EG")} ج.م</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1 text-center">
              <span className="text-xs font-extrabold text-primary block">سعر البيع لتقديم عرض السعر:</span>
              <p className="text-3xl font-black text-primary">
                {suggestedSellingPrice.toLocaleString("ar-EG")} ج.م
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="w-full h-11 bg-primary text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
            >
              <Printer size={16} />
              معاينة وطباعة كارت التكلفة A4
            </button>
          </div>
        </div>
      </div>

      {/* Printable Costing Sheet Portal */}
      {showPrintModal && (
        <PrintPortal>
          <div className="printable-modal-overlay fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden">
            <div className="printable-modal-card bg-card w-full max-w-3xl rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden">
              <div className="bg-card border-b border-border px-4 py-3 shadow-sm flex items-center justify-between print:hidden">
                <h2 className="text-sm font-extrabold flex items-center gap-2">
                  <Printer size={18} className="text-primary" /> معاينة وتصدير كارت التكلفة
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-primary text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <Printer size={15} /> طباعة وحفظ كـ PDF
                  </button>
                  <button
                    onClick={() => setShowPrintModal(false)}
                    className="px-3.5 py-2 bg-muted text-foreground rounded-xl text-xs font-bold"
                  >
                    إغلاق
                  </button>
                </div>
              </div>

              <div className="printable-modal-body p-6 space-y-6">
                <div className="border-b pb-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black text-primary">{jobTitle}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">دراسة وتفاصيل التكاليف وسعر البيع المستهدف</p>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">{new Date().toLocaleDateString("ar-EG")}</span>
                </div>

                {/* Materials Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-amber-700">أولاً: الخامات والمواد</h4>
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-amber-500/10 text-amber-800 font-bold border-b border-border">
                        <th className="p-2">#</th>
                        <th className="p-2">الخامة</th>
                        <th className="p-2">الكمية</th>
                        <th className="p-2">سعر التكلفة</th>
                        <th className="p-2">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {materials.map((m, idx) => (
                        <tr key={m.id}>
                          <td className="p-2 font-bold">{idx + 1}</td>
                          <td className="p-2 font-bold">{m.name}</td>
                          <td className="p-2">{m.quantity}</td>
                          <td className="p-2">{m.unitCost.toLocaleString("ar-EG")} ج.م</td>
                          <td className="p-2 font-bold">{(m.quantity * m.unitCost).toLocaleString("ar-EG")} ج.م</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Labor Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-purple-700">ثانياً: المصنوعية والخدمات</h4>
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-purple-500/10 text-purple-800 font-bold border-b border-border">
                        <th className="p-2">#</th>
                        <th className="p-2">الخدمة</th>
                        <th className="p-2">الكمية</th>
                        <th className="p-2">التكلفة</th>
                        <th className="p-2">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {services.map((s, idx) => (
                        <tr key={s.id}>
                          <td className="p-2 font-bold">{idx + 1}</td>
                          <td className="p-2 font-bold">{s.name}</td>
                          <td className="p-2">{s.quantity}</td>
                          <td className="p-2">{s.unitCost.toLocaleString("ar-EG")} ج.م</td>
                          <td className="p-2 font-bold">{(s.quantity * s.unitCost).toLocaleString("ar-EG")} ج.م</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary Table */}
                <div className="flex justify-end pt-2">
                  <div className="w-72 border rounded-xl p-3 space-y-1.5 text-xs text-right bg-muted/20">
                    <div className="flex justify-between"><span>إجمالي الخامات:</span><span className="font-bold">{rawMaterialsTotal.toLocaleString("ar-EG")} ج.م</span></div>
                    <div className="flex justify-between"><span>إجمالي المصنوعية:</span><span className="font-bold">{servicesTotal.toLocaleString("ar-EG")} ج.م</span></div>
                    <div className="flex justify-between"><span>الهالك ({wastePercent}%):</span><span>{wasteAmount.toLocaleString("ar-EG")} ج.م</span></div>
                    <div className="flex justify-between"><span>مصاريف تشغيل ({overheadPercent}%):</span><span>{overheadAmount.toLocaleString("ar-EG")} ج.م</span></div>
                    <div className="flex justify-between pt-1 border-t font-black text-rose-600"><span>التكلفة الحقيقية:</span><span>{totalNetCost.toLocaleString("ar-EG")} ج.م</span></div>
                    <div className="flex justify-between font-black text-emerald-600"><span>الربح المستهدف ({profitMarginPercent}%):</span><span>+ {profitAmount.toLocaleString("ar-EG")} ج.م</span></div>
                    <div className="flex justify-between pt-1 border-t font-black text-sm text-primary"><span>سعر البيع المقترح:</span><span>{suggestedSellingPrice.toLocaleString("ar-EG")} ج.م</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PrintPortal>
      )}
    </div>
  );
}
