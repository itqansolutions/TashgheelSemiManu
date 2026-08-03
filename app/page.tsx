"use client";

import React, { useState } from "react";
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
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Clean initial test state metrics (EGP Currency)
  const stats = [
    {
      title: "إجمالي المبيعات",
      value: "0 ج.م",
      change: "0%",
      isPositive: true,
      icon: DollarSign,
      color: "var(--primary)",
      bg: "hsl(var(--primary) / 0.1)",
    },
    {
      title: "أوامر التشغيل النشطة",
      value: "0 أمر عمل",
      change: "جاهز للتست",
      isPositive: true,
      icon: Factory,
      color: "#0284c7",
      bg: "rgba(2, 132, 199, 0.1)",
    },
    {
      title: "المواد والمنتجات بالمخزن",
      value: "0 صنف",
      change: "المخزن فارغ",
      isPositive: true,
      icon: Boxes,
      color: "#eab308",
      bg: "rgba(234, 179, 8, 0.1)",
    },
    {
      title: "العملاء والموردين",
      value: "0 شريك",
      change: "جاهز للإضافة",
      isPositive: true,
      icon: Users,
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.1)",
    },
  ];

  // Empty orders array for fresh test environment
  const recentOrders: Array<{
    id: string;
    customer: string;
    product: string;
    status: string;
    statusColor: string;
    date: string;
    amount: string;
  }> = [];

  const quickActions = [
    { title: "أمر عمل جديد", icon: Factory, color: "hsl(var(--primary))" },
    { title: "إضافة عميل", icon: Users, color: "#0284c7" },
    { title: "إذن صرف مخزني", icon: Package, color: "#eab308" },
    { title: "فاتورة مبيعات", icon: FileText, color: "#10b981" },
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
            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg bg-muted/60 text-foreground"
            >
              <Menu size={20} />
            </button>

            {/* Search Input */}
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

          {/* Top Actions */}
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <button className="relative w-9 h-9 rounded-full border border-border bg-background flex items-center justify-center text-foreground">
              <Bell size={18} />
              <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-primary" />
            </button>

            {/* User Profile Info */}
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

            {/* Logout Button */}
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
                بيئة العمل والبيانات مجهزة بالكامل لبدء التست الخاص بك
              </div>
              <h1 className="text-xl md:text-2xl font-black">
                أهلاً بك، {user?.name ?? "مدير النظام"} 👋
              </h1>
              <p className="text-xs md:text-sm opacity-90">
                العملة المعتمدة للنظام: الجنيه المصري (ج.م) | المقر الرئيسي
              </p>
            </div>

            {/* Quick Action Buttons Grid */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5">
              {quickActions.map((act, i) => (
                <button
                  key={i}
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

          {/* Section: Table or Empty Test State */}
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

              <button className="flex items-center gap-1 text-xs md:text-sm font-bold text-primary hover:underline">
                <span>عرض الكل</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Clean Test State Empty View */}
            {recentOrders.length === 0 ? (
              <div className="py-10 px-4 text-center bg-background rounded-xl border border-dashed border-border flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <FolderOpen size={26} />
                </div>
                <h4 className="text-sm md:text-base font-bold mb-1">
                  لا توجد أوامر عمل أو بيانات وهمية حالياً
                </h4>
                <p className="text-xs md:text-sm text-muted-foreground max-w-sm mb-4">
                  النظام نظيف ومجهز بالكامل لبدء إجراء التست الخاّص بك. يمكنك إضافة أول أمر عمل الآن.
                </p>
                <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white font-bold text-xs md:text-sm active:scale-95 transition-transform">
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
          onClick={() => setActiveTab("production")}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            activeTab === "production" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Factory size={18} />
          <span>التصنيع</span>
        </button>

        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            activeTab === "inventory" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Boxes size={18} />
          <span>المخازن</span>
        </button>

        <button
          onClick={() => setActiveTab("partners")}
          className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
            activeTab === "partners" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Users size={18} />
          <span>الشركاء</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-muted-foreground"
        >
          <Menu size={18} />
          <span>القائمة</span>
        </button>
      </nav>
    </div>
  );
}
