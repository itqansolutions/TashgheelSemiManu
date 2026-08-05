"use client";

import { useState, useEffect } from "react";
import {
  Building2, Image as ImageIcon, Phone, Mail, MapPin,
  CheckCircle, Loader2, Save, Palette, FileText, Upload,
  Sparkles, ShieldCheck, CreditCard,
} from "lucide-react";
import { toast } from "sonner";

interface SettingsState {
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

const THEME_OPTIONS = [
  { name: "الأزرق القياسي", color: "#0284c7", bg: "bg-sky-600" },
  { name: "الكحلي الملكي", color: "#1e3a8a", bg: "bg-blue-900" },
  { name: "الزمردي التخصيصي", color: "#059669", bg: "bg-emerald-600" },
  { name: "البنفسجي العصري", color: "#7c3aed", bg: "bg-purple-600" },
  { name: "الفحمي الفاخر", color: "#1f2937", bg: "bg-slate-800" },
  { name: "العنابي الداكن", color: "#881337", bg: "bg-rose-900" },
];

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsState>({
    name: "المقر الرئيسي",
    logo: "",
    phone: "",
    email: "",
    address: "",
    taxNumber: "",
    commercialReg: "",
    themeColor: "#0284c7",
    printNotes: "شروط التسليم: التسليم في موقع الشركة. الضمان لمدة عام ضد عيوب التصنيع.",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.success && data.data) {
          setForm({
            name: data.data.name || "المقر الرئيسي",
            logo: data.data.logo || "",
            phone: data.data.phone || "",
            email: data.data.email || "",
            address: data.data.address || "",
            taxNumber: data.data.taxNumber || "",
            commercialReg: data.data.commercialReg || "",
            themeColor: data.data.themeColor || "#0284c7",
            printNotes: data.data.printNotes || "",
          });
        }
      } catch {
        toast.error("فشل تحميل إعدادات الشركة");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error("حجم الصورة كبير جداً. الحد الأقصى 2 ميجابايت");
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((prev) => ({ ...prev, logo: reader.result as string }));
        toast.success("تم رفع اللوجو بنجاح (معاينة)");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("اسم الشركة مطلوب");

    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.message || "فشل حفظ الإعدادات");

      toast.success("تم حفظ إعدادات الشركة وثيم المطبوعات بنجاح 🎉");
    } catch {
      toast.error("تعذر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">إعدادات الشركة والمطبوعات</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            تخصيص لوجو ورأس الفاتورة وعروض الأسعار وألوان الثيم المطبوع
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm active:scale-95 transition-transform shadow-md shadow-primary/20"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>حفظ التغييرات</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: General & Logo Info (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Company Logo & Identity */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <h2 className="text-base font-extrabold flex items-center gap-2 border-b border-border pb-3">
              <Building2 size={18} className="text-primary" />
              هوية وثوابت الشركة واللوجو
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-muted/20 border border-border">
              <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-primary/30 bg-background flex flex-col items-center justify-center relative overflow-hidden flex-shrink-0 group">
                {form.logo ? (
                  <img src={form.logo} alt="شعار الشركة" className="w-full h-full object-contain p-2" />
                ) : (
                  <div className="text-center p-2 text-muted-foreground">
                    <ImageIcon size={28} className="mx-auto mb-1 opacity-50" />
                    <span className="text-[10px] font-bold block">رفع اللوجو</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <div className="space-y-1 text-center sm:text-right">
                <h3 className="font-bold text-sm">لوجو الشركة (Logo)</h3>
                <p className="text-xs text-muted-foreground">
                  سيتم إظهاره بوضوح في أعلى عروض الأسعار وفواتير المبيعات وكشوف الحسابات.
                </p>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg cursor-pointer hover:bg-primary/20 mt-1">
                  <Upload size={13} /> اختر صورة الشعار
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold mb-1 block">اسم الشركة / الورشة الرئيسي *</label>
                <input
                  type="text"
                  required
                  placeholder="المقر الرئيسي / ورشة تشغيل المعادن"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold mb-1 block">رقم الهاتف الرسمي</label>
                <input
                  type="text"
                  placeholder="01000000000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold mb-1 block">الرقم الضريبي (Tax ID)</label>
                <input
                  type="text"
                  placeholder="123-456-789"
                  value={form.taxNumber}
                  onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold mb-1 block">السجل التجاري (CR)</label>
                <input
                  type="text"
                  placeholder="1010099221"
                  value={form.commercialReg}
                  onChange={(e) => setForm({ ...form, commercialReg: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold mb-1 block">البريد الإلكتروني</label>
                <input
                  type="email"
                  placeholder="info@tashgheel.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold mb-1 block">عنوان الورشة / المقر</label>
                <input
                  type="text"
                  placeholder="القاهرة - المنطقة الصناعية"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Print Terms & Notes */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-extrabold flex items-center gap-2 border-b border-border pb-3">
              <FileText size={18} className="text-primary" />
              الشروط والأحكام وبيانات البنك الافتراضية
            </h2>
            <div>
              <label className="text-xs font-bold mb-1 block">الشروط والحسابات البنكية المطبوعة أسفل الفاتورة</label>
              <textarea
                rows={4}
                placeholder="أدخل الشروط الافتراضية والحساب البنكي (مثل: البنك الأهلي المصري حساب رقم...)..."
                value={form.printNotes}
                onChange={(e) => setForm({ ...form, printNotes: e.target.value })}
                className="w-full p-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Theme & Live Header Preview (1 col) */}
        <div className="space-y-6">
          {/* Card 3: Theme Color Palette */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-base font-extrabold flex items-center gap-2 border-b border-border pb-3">
              <Palette size={18} className="text-primary" />
              لون ثيم المطبوعات
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              {THEME_OPTIONS.map((t) => {
                const isSelected = form.themeColor === t.color;
                return (
                  <button
                    key={t.color}
                    type="button"
                    onClick={() => setForm({ ...form, themeColor: t.color })}
                    className={`p-3 rounded-xl border text-right transition-all flex items-center gap-2 ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : "border-border hover:bg-muted/30"
                    }`}
                  >
                    <span style={{ background: t.color }} className="w-5 h-5 rounded-full flex-shrink-0" />
                    <span className="text-xs font-bold">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 4: Live Print Header Preview */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
            <h2 className="text-xs font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              معاينة فورية لرأس الفاتورة وعرض السعر
            </h2>

            <div className="p-4 rounded-xl border border-border bg-background shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: `${form.themeColor}30` }}>
                <div className="flex items-center gap-2.5">
                  {form.logo ? (
                    <img src={form.logo} alt="Logo Preview" className="w-10 h-10 object-contain rounded" />
                  ) : (
                    <div style={{ background: form.themeColor }} className="w-10 h-10 rounded-lg text-white font-black text-sm flex items-center justify-center">
                      {form.name[0] || "ش"}
                    </div>
                  )}
                  <div>
                    <h4 className="font-black text-xs" style={{ color: form.themeColor }}>
                      {form.name || "اسم الشركة"}
                    </h4>
                    <p className="text-[10px] text-muted-foreground">
                      {form.phone && `ت: ${form.phone}`}
                    </p>
                  </div>
                </div>

                <div className="text-left">
                  <span style={{ background: form.themeColor }} className="px-2 py-0.5 text-[10px] font-bold text-white rounded">
                    عرض سعر / فاتورة
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-1">INV-2026-0001</p>
                </div>
              </div>

              <div className="text-[10px] text-muted-foreground space-y-0.5">
                {form.taxNumber && <p>الرقم الضريبي: {form.taxNumber}</p>}
                {form.address && <p>العنوان: {form.address}</p>}
              </div>

              <div className="pt-2 text-center text-[10px] font-bold text-emerald-600 border-t border-border">
                ✓ جاهز للطباعة بالتنسيق الجديد
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
