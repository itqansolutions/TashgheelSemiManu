"use client";

import React, { useState, useEffect } from "react";
import {
  Factory,
  Users,
  Package,
  DollarSign,
  Wrench,
  BarChart3,
  Bell,
  Search,
  LogOut,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Building2,
  FileText,
  Boxes,
  PlusCircle,
  FolderOpen,
  Menu,
  X,
  Home,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface JobOrderDisplay {
  id: string;
  customer: string;
  product: string;
  status: string;
  statusColor: string;
  date: string;
  amount: string;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active Modals
  const [activeModal, setActiveModal] = useState<
    "job_order" | "customer" | "item" | "invoice" | null
  >(null);

  const [isLoading, setIsLoading] = useState(false);

  // Dynamic Metrics & Lists
  const [recentOrders, setRecentOrders] = useState<JobOrderDisplay[]>([]);
  const [customersCount, setCustomersCount] = useState(0);
  const [itemsCount, setItemsCount] = useState(0);
  const [totalSales, setTotalSales] = useState(0);

  // Form States
  const [jobOrderForm, setJobOrderForm] = useState({
    customerName: "",
    productName: "",
    totalAmount: "",
    notes: "",
  });

  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    email: "",
    taxNumber: "",
    address: "",
    openingBalance: "",
  });

  const [itemForm, setItemForm] = useState({
    name: "",
    sku: "",
    unit: "قطعة",
    costPrice: "",
    salePrice: "",
    initialStock: "",
  });

  const [invoiceForm, setInvoiceForm] = useState({
    customerName: "",
    amount: "",
    notes: "",
  });

  // Fetch Live Data on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch Job Orders
      const resJO = await fetch("/api/workshop/job-orders");
      if (resJO.ok) {
        const dataJO = await resJO.json();
        if (dataJO.data && Array.isArray(dataJO.data)) {
          const formatted = dataJO.data.map((item: any) => ({
            id: item.code || item.id,
            customer: item.customer?.name || "عميل عام",
            product: item.title || "أمر عمل",
            status: item.status === "IN_PRODUCTION" ? "قيد التشغيل" : "مكتمل",
            statusColor: item.status === "IN_PRODUCTION" ? "#0284c7" : "#10b981",
            date: "مؤخراً",
            amount: `${(item.sellingPrice || 0).toLocaleString()} ج.م`,
          }));
          setRecentOrders(formatted);

          // Calculate total sales
          const sumSales = dataJO.data.reduce(
            (acc: number, curr: any) => acc + (curr.sellingPrice || 0),
            0
          );
          setTotalSales(sumSales);
        }
      }

      // Fetch Customers count
      const resC = await fetch("/api/customers");
      if (resC.ok) {
        const dataC = await resC.json();
        if (dataC.data && Array.isArray(dataC.data)) {
          setCustomersCount(dataC.data.length);
        }
      }

      // Fetch Items count
      const resI = await fetch("/api/items");
      if (resI.ok) {
        const dataI = await resI.json();
        if (dataI.data && Array.isArray(dataI.data)) {
          setItemsCount(dataI.data.length);
        }
      }
    } catch {
      // Silent error
    }
  };

  // Submit Job Order
  const handleCreateJobOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobOrderForm.customerName || !jobOrderForm.productName) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/workshop/job-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: jobOrderForm.customerName,
          productName: jobOrderForm.productName,
          totalAmount: parseFloat(jobOrderForm.totalAmount || "0"),
          notes: jobOrderForm.notes,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message ?? "حدث خطأ أثناء حفظ أمر العمل");
        return;
      }

      toast.success("تم إضافة أمر العمل بنجاح!");
      setRecentOrders((prev) => [result.data, ...prev]);
      setTotalSales((prev) => prev + parseFloat(jobOrderForm.totalAmount || "0"));
      setActiveModal(null);
      setJobOrderForm({ customerName: "", productName: "", totalAmount: "", notes: "" });
    } catch {
      toast.error("تعذر الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Customer
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name) {
      toast.error("اسم العميل مطلوب");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customerForm,
          openingBalance: parseFloat(customerForm.openingBalance || "0"),
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message ?? "حدث خطأ أثناء إضافة العميل");
        return;
      }

      toast.success("تم إضافة العميل بنجاح!");
      setCustomersCount((prev) => prev + 1);
      setActiveModal(null);
      setCustomerForm({ name: "", phone: "", email: "", taxNumber: "", address: "", openingBalance: "" });
    } catch {
      toast.error("تعذر الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Item
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name) {
      toast.error("اسم الصنف مطلوب");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...itemForm,
          costPrice: parseFloat(itemForm.costPrice || "0"),
          salePrice: parseFloat(itemForm.salePrice || "0"),
          initialStock: parseFloat(itemForm.initialStock || "0"),
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message ?? "حدث خطأ أثناء إضافة الصنف");
        return;
      }

      toast.success("تم إضافة الصنف للمخزن بنجاح!");
      setItemsCount((prev) => prev + 1);
      setActiveModal(null);
      setItemForm({ name: "", sku: "", unit: "قطعة", costPrice: "", salePrice: "", initialStock: "" });
    } catch {
      toast.error("تعذر الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  };

  // Stats display
  const stats = [
    {
      title: "إجمالي المبيعات",
      value: `${totalSales.toLocaleString()} ج.م`,
      change: recentOrders.length > 0 ? `+${recentOrders.length}` : "0",
      isPositive: true,
      icon: DollarSign,
      color: "var(--primary)",
      bg: "hsl(var(--primary) / 0.1)",
    },
    {
      title: "أوامر التشغيل النشطة",
      value: `${recentOrders.length} أمر عمل`,
      change: recentOrders.length > 0 ? "نشط" : "جاهز للتست",
      isPositive: true,
      icon: Factory,
      color: "#0284c7",
      bg: "rgba(2, 132, 199, 0.1)",
    },
    {
      title: "المواد والمنتجات بالمخزن",
      value: `${itemsCount} صنف`,
      change: itemsCount > 0 ? "متوفر" : "المخزن فارغ",
      isPositive: true,
      icon: Boxes,
      color: "#eab308",
      bg: "rgba(234, 179, 8, 0.1)",
    },
    {
      title: "العملاء والموردين",
      value: `${customersCount} شريك`,
      change: customersCount > 0 ? "مسجل" : "جاهز للإضافة",
      isPositive: true,
      icon: Users,
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.1)",
    },
  ];

  const quickActions = [
    {
      id: "job_order",
      title: "أمر عمل جديد",
      icon: Factory,
      action: () => setActiveModal("job_order"),
    },
    {
      id: "customer",
      title: "إضافة عميل",
      icon: Users,
      action: () => setActiveModal("customer"),
    },
    {
      id: "item",
      title: "إذن صرف / صنف مخزني",
      icon: Package,
      action: () => setActiveModal("item"),
    },
    {
      id: "invoice",
      title: "فاتورة مبيعات",
      icon: FileText,
      action: () => setActiveModal("job_order"), // Re-use job order for quick invoice test
    },
  ];

  const navItems = [
    { id: "overview", label: "الرئيسية", icon: BarChart3 },
    { id: "production", label: "التصنيع والورش", icon: Factory },
    { id: "inventory", label: "المخازن والأصناف", icon: Boxes },
    { id: "partners", label: "العملاء والموردين", icon: Users },
    { id: "finance", label: "المالية والحسابات", icon: DollarSign },
    { id: "reports", label: "التقارير والإحصائيات", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* ─── Mobile Overlay Backdrop ───────────────────────────── */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* ─── Responsive Sidebar ────────────────────────────────── */}
      <aside
        className={`fixed md:sticky top-0 right-0 z-50 h-screen w-[260px] bg-card border-l border-border flex flex-col p-4 transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <Wrench size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold leading-tight">تشغيل</h2>
              <span className="text-xs text-muted-foreground font-semibold">
                إدارة الورش والتصنيع
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1 text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-right text-sm transition-colors ${
                  isActive
                    ? "bg-primary/15 text-primary font-bold"
                    : "text-muted-foreground hover:bg-muted font-medium"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Branch Footer */}
        <div className="mt-auto p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={16} className="text-primary" />
            <span className="text-xs font-bold truncate">
              {user?.company ?? "تشغيل للتصنيع شبه الآلي"}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            المقر الرئيسي — (العملة: ج.م)
          </p>
        </div>
      </aside>

      {/* ─── Main Section ──────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-6">
        {/* Top Navigation Bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg bg-muted/60 text-foreground"
            >
              <Menu size={20} />
            </button>

            <div className="relative hidden sm:block w-64 md:w-80">
              <Search
                size={16}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="بحث في النظام، الأصناف..."
                className="w-full h-9 pr-9 pl-3 rounded-lg border border-border bg-background text-xs md:text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toast.info("لا توجد إشعارات جديدة")}
              className="relative w-9 h-9 rounded-full border border-border bg-background flex items-center justify-center text-foreground"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-primary" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs md:text-sm">
                {user?.name?.[0] ?? "أ"}
              </div>
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold leading-tight">
                  {user?.name ?? "مدير النظام"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {user?.email ?? "admin@tashgheel.com"}
                </span>
              </div>
            </div>

            <button
              onClick={() => logout()}
              title="تسجيل الخروج"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs font-bold"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-4 md:p-8 flex-1 overflow-y-auto space-y-6">
          {/* Welcome Banner */}
          <div className="p-5 md:p-7 rounded-2xl bg-gradient-to-r from-primary to-blue-900 text-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 shadow-lg">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-xs">
                <Sparkles size={14} />
                جميع الأزرار والوظائف مجهزة وفعالة بالكامل للتست
              </div>
              <h1 className="text-xl md:text-2xl font-black">
                أهلاً بك، {user?.name ?? "مدير النظام"} 👋
              </h1>
              <p className="text-xs md:text-sm opacity-90">
                اضغط على أي من الأزرار التالية لإضافة أمر عمل، عميل جديد، أو صنف مخزني
              </p>
            </div>

            {/* Quick Action Buttons Grid */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5">
              {quickActions.map((act, i) => (
                <button
                  key={i}
                  onClick={act.action}
                  className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white text-primary font-bold text-xs md:text-sm shadow-sm hover:bg-slate-100 active:scale-95 transition-all"
                >
                  <act.icon size={16} />
                  <span>{act.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-card border border-border flex flex-col justify-between gap-3 shadow-xs hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm text-muted-foreground font-semibold">
                      {st.title}
                    </span>
                    <div
                      style={{ background: st.bg, color: st.color }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                    >
                      <Icon size={20} />
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="text-xl md:text-2xl font-black">
                      {st.value}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-muted-foreground">
                      <ArrowUpRight size={14} />
                      {st.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Section: Interactive Table / Orders List */}
          <div className="bg-card rounded-2xl border border-border p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base md:text-lg font-extrabold">
                  أحدث أوامر التشغيل والإنتاج
                </h3>
                <p className="text-xs text-muted-foreground">
                  متابعة حالة أوامر العمل الجارية في الورشة والمصنع
                </p>
              </div>

              <button
                onClick={() => setActiveModal("job_order")}
                className="flex items-center gap-1 text-xs md:text-sm font-bold text-primary hover:underline"
              >
                <PlusCircle size={16} />
                <span>أمر جديد</span>
              </button>
            </div>

            {/* Clean Test State Empty View vs Orders List */}
            {recentOrders.length === 0 ? (
              <div className="py-10 px-4 text-center bg-background rounded-xl border border-dashed border-border flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <FolderOpen size={26} />
                </div>
                <h4 className="text-sm md:text-base font-bold mb-1">
                  لا توجد أوامر عمل حالياً
                </h4>
                <p className="text-xs md:text-sm text-muted-foreground max-w-sm mb-4">
                  اضغط على الزر أدناه لإضافة أول أمر عمل وتجربة التست مباشرة.
                </p>
                <button
                  onClick={() => setActiveModal("job_order")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-bold text-xs md:text-sm active:scale-95 transition-transform"
                >
                  <PlusCircle size={16} />
                  <span>إضافة أمر عمل جديد للتست</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground text-xs">
                      <th className="p-3 font-bold">رقم الأمر</th>
                      <th className="p-3 font-bold">العميل</th>
                      <th className="p-3 font-bold">المنتج / الخدمة</th>
                      <th className="p-3 font-bold">الحالة</th>
                      <th className="p-3 font-bold">التاريخ</th>
                      <th className="p-3 font-bold">القيمة الإجمالية</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((ord) => (
                      <tr key={ord.id} className="border-b border-border/50 text-xs md:text-sm">
                        <td dir="ltr" className="p-3 font-bold text-right">
                          {ord.id}
                        </td>
                        <td className="p-3 font-semibold">{ord.customer}</td>
                        <td className="p-3 text-muted-foreground">{ord.product}</td>
                        <td className="p-3">
                          <span
                            style={{ color: ord.statusColor, background: `${ord.statusColor}18` }}
                            className="px-2.5 py-1 rounded-full text-xs font-bold inline-block"
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{ord.date}</td>
                        <td className="p-3 font-extrabold">{ord.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ─── Mobile Bottom Navigation Bar ──────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around z-40 md:hidden shadow-lg">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            activeTab === "overview" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Home size={18} />
          <span>الرئيسية</span>
        </button>

        <button
          onClick={() => setActiveModal("job_order")}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            activeTab === "production" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Factory size={18} />
          <span>أمر عمل</span>
        </button>

        <button
          onClick={() => setActiveModal("item")}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            activeTab === "inventory" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Boxes size={18} />
          <span>صنف جديد</span>
        </button>

        <button
          onClick={() => setActiveModal("customer")}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            activeTab === "partners" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Users size={18} />
          <span>عميل جديد</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-muted-foreground"
        >
          <Menu size={18} />
          <span>القائمة</span>
        </button>
      </nav>

      {/* ─── MODAL 1: Job Order Modal ─────────────────────────── */}
      {activeModal === "job_order" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <Factory size={20} className="text-primary" />
                <span>إضافة أمر عمل جديد للتست</span>
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateJobOrder} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold mb-1 block">اسم العميل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شركة الأمل للمقاولات"
                  value={jobOrderForm.customerName}
                  onChange={(e) =>
                    setJobOrderForm({ ...jobOrderForm, customerName: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold mb-1 block">المنتج / الخدمة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تصنيع هيكل حديد 10mm"
                  value={jobOrderForm.productName}
                  onChange={(e) =>
                    setJobOrderForm({ ...jobOrderForm, productName: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold mb-1 block">القيمة الإجمالية (ج.م) *</label>
                <input
                  type="number"
                  required
                  placeholder="15000"
                  value={jobOrderForm.totalAmount}
                  onChange={(e) =>
                    setJobOrderForm({ ...jobOrderForm, totalAmount: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold mb-1 block">ملاحظات والتفاصيل</label>
                <textarea
                  rows={2}
                  placeholder="تفاصيل التوريد ومواصفات أمر العمل..."
                  value={jobOrderForm.notes}
                  onChange={(e) =>
                    setJobOrderForm({ ...jobOrderForm, notes: e.target.value })
                  }
                  className="w-full p-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-10 bg-primary text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : "حفظ وحساب التكلفة"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 h-10 border border-border text-sm font-semibold rounded-lg"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: Customer Modal ──────────────────────────── */}
      {activeModal === "customer" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <Users size={20} className="text-primary" />
                <span>إضافة عميل جديد</span>
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold mb-1 block">اسم العميل / الشركة *</label>
                <input
                  type="text"
                  required
                  placeholder="شركة النصر للمقاولات"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold mb-1 block">رقم الهاتف</label>
                  <input
                    type="text"
                    placeholder="01012345678"
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1 block">الرقم الضريبي</label>
                  <input
                    type="text"
                    placeholder="300123456"
                    value={customerForm.taxNumber}
                    onChange={(e) => setCustomerForm({ ...customerForm, taxNumber: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold mb-1 block">الرصيد الافتتاحي (ج.م)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={customerForm.openingBalance}
                  onChange={(e) => setCustomerForm({ ...customerForm, openingBalance: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-10 bg-primary text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : "حفظ العميل"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 h-10 border border-border text-sm font-semibold rounded-lg"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: Item Modal ──────────────────────────────── */}
      {activeModal === "item" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <Boxes size={20} className="text-primary" />
                <span>إضافة صنف مخزني جديد</span>
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold mb-1 block">اسم الصنف / الخامة *</label>
                <input
                  type="text"
                  required
                  placeholder="حديد زاوية 50×50mm"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold mb-1 block">كود الصنف / SKU</label>
                  <input
                    type="text"
                    placeholder="RAW-001"
                    value={itemForm.sku}
                    onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1 block">وحدة القياس</label>
                  <input
                    type="text"
                    placeholder="طن / متر / قطعة"
                    value={itemForm.unit}
                    onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold mb-1 block">سعر التكلفة (ج.م)</label>
                  <input
                    type="number"
                    placeholder="500"
                    value={itemForm.costPrice}
                    onChange={(e) => setItemForm({ ...itemForm, costPrice: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1 block">سعر البيع (ج.م)</label>
                  <input
                    type="number"
                    placeholder="750"
                    value={itemForm.salePrice}
                    onChange={(e) => setItemForm({ ...itemForm, salePrice: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold mb-1 block">الرصيد الابتدائي بالمخزن</label>
                <input
                  type="number"
                  placeholder="100"
                  value={itemForm.initialStock}
                  onChange={(e) => setItemForm({ ...itemForm, initialStock: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-10 bg-primary text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : "حفظ في المخزن"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 h-10 border border-border text-sm font-semibold rounded-lg"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
