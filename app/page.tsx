"use client";

import React, { useState } from "react";
import {
  Factory,
  Users,
  Truck,
  Package,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Wrench,
  BarChart3,
  Bell,
  Search,
  LogOut,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShieldCheck,
  Building2,
  FileText,
  Boxes,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const stats = [
    {
      title: "إجمالي المبيعات",
      value: "148,500 ر.س",
      change: "+12.4%",
      isPositive: true,
      icon: DollarSign,
      color: "var(--primary)",
      bg: "hsl(var(--primary) / 0.1)",
    },
    {
      title: "أوامر التشغيل النشطة",
      value: "24 أمر عمل",
      change: "+4 جديدة",
      isPositive: true,
      icon: Factory,
      color: "#0284c7",
      bg: "rgba(2, 132, 199, 0.1)",
    },
    {
      title: "المواد والمنتجات بالمخزن",
      value: "1,420 صنف",
      change: "-8 نقص مخزون",
      isPositive: false,
      icon: Boxes,
      color: "#eab308",
      bg: "rgba(234, 179, 8, 0.1)",
    },
    {
      title: "العملاء والموردين",
      value: "86 شريك",
      change: "+3 هذا الشهر",
      isPositive: true,
      icon: Users,
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.1)",
    },
  ];

  const recentOrders = [
    {
      id: "WO-2026-001",
      customer: "شركة الأفق للصناعات المتطورة",
      product: "هيكل معدني مجلفن 12mm",
      status: "قيد التشغيل",
      statusColor: "#0284c7",
      date: "منذ ساعتين",
      amount: "34,200 ر.س",
    },
    {
      id: "WO-2026-002",
      customer: "مصنع الخليج للبلاستيك",
      product: "قوالب تشكيل هيدروليكية",
      status: "مكتمل",
      statusColor: "#10b981",
      date: "اليوم 10:30 ص",
      amount: "18,900 ر.س",
    },
    {
      id: "WO-2026-003",
      customer: "مؤسسة الأعمال الميكانيكية",
      product: "قطع غيار صيانة توربينات",
      status: "انتظار مواد",
      statusColor: "#f59e0b",
      date: "أمس",
      amount: "9,450 ر.س",
    },
    {
      id: "WO-2026-004",
      customer: "شركة الرياض للمقاولات",
      product: "أعمدة حديد التسليح المحزز",
      status: "قيد التشغيل",
      statusColor: "#0284c7",
      date: "أمس",
      amount: "52,000 ر.س",
    },
  ];

  const quickActions = [
    { title: "أمر عمل جديد", icon: Factory, color: "hsl(var(--primary))" },
    { title: "إضافة عميل", icon: Users, color: "#0284c7" },
    { title: "إذن صرف مخزني", icon: Package, color: "#eab308" },
    { title: "فاتورة مبيعات", icon: FileText, color: "#10b981" },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
        fontFamily: "var(--font-sans, system-ui, sans-serif)",
      }}
    >
      {/* ─── Sidebar ───────────────────────────────────────────── */}
      <aside
        style={{
          width: "260px",
          borderLeft: "1px solid hsl(var(--border))",
          background: "hsl(var(--card))",
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem 1rem",
        }}
      >
        {/* Logo & Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0 0.5rem 1.5rem 0.5rem",
            borderBottom: "1px solid hsl(var(--border))",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background:
                "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px hsl(var(--primary) / 0.25)",
            }}
          >
            <Wrench size={22} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 800, lineHeight: 1.2 }}>
              تشغيل
            </h2>
            <span
              style={{
                fontSize: "0.75rem",
                color: "hsl(var(--muted-foreground))",
                fontWeight: 600,
              }}
            >
              إدارة الورش والتصنيع
            </span>
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.375rem", flex: 1 }}>
          {[
            { id: "overview", label: "لوحة التحكم الرئيسية", icon: BarChart3 },
            { id: "production", label: "إدارة التصنيع والورش", icon: Factory },
            { id: "inventory", label: "المخازن والأصناف", icon: Boxes },
            { id: "partners", label: "العملاء والموردين", icon: Users },
            { id: "finance", label: "المالية والحسابات", icon: DollarSign },
            { id: "reports", label: "التقارير والإحصائيات", icon: FileText },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "var(--radius)",
                  border: "none",
                  background: isActive
                    ? "hsl(var(--primary) / 0.12)"
                    : "transparent",
                  color: isActive
                    ? "hsl(var(--primary))"
                    : "hsl(var(--muted-foreground))",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.9375rem",
                  cursor: "pointer",
                  textAlign: "right",
                  transition: "all 0.2s ease",
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Company & Branch Card */}
        <div
          style={{
            padding: "1rem",
            borderRadius: "var(--radius)",
            background: "hsl(var(--muted) / 0.5)",
            border: "1px solid hsl(var(--border))",
            marginTop: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <Building2 size={16} style={{ color: "hsl(var(--primary))" }} />
            <span style={{ fontSize: "0.875rem", fontWeight: 700 }}>
              {user?.company ?? "شركة تشغيل الصناعية"}
            </span>
          </div>
          <p style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
            الفرع الرئيسي — الرياض
          </p>
        </div>
      </aside>

      {/* ─── Main Content ──────────────────────────────────────── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <header
          style={{
            height: "72px",
            borderBottom: "1px solid hsl(var(--border))",
            background: "hsl(var(--card))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 2rem",
          }}
        >
          {/* Search bar */}
          <div
            style={{
              position: "relative",
              width: "320px",
            }}
          >
            <Search
              size={18}
              style={{
                position: "absolute",
                top: "50%",
                right: "12px",
                transform: "translateY(-50%)",
                color: "hsl(var(--muted-foreground))",
              }}
            />
            <input
              type="text"
              placeholder="بحث في النظام، أوامر العمل، الأصناف..."
              style={{
                width: "100%",
                height: "40px",
                padding: "0 2.5rem 0 1rem",
                borderRadius: "var(--radius)",
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--background))",
                color: "hsl(var(--foreground))",
                fontSize: "0.875rem",
              }}
            />
          </div>

          {/* Right Header Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            {/* Notification button */}
            <button
              style={{
                position: "relative",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--background))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "hsl(var(--foreground))",
              }}
            >
              <Bell size={18} />
              <span
                style={{
                  position: "absolute",
                  top: "8px",
                  left: "8px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "hsl(var(--destructive))",
                }}
              />
            </button>

            {/* User Info */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                {user?.name?.[0] ?? "أ"}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 700 }}>
                  {user?.name ?? "المدير العام"}
                </span>
                <span style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
                  {user?.email ?? "admin@tashgheel.com"}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={() => logout()}
              title="تسجيل الخروج"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.875rem",
                borderRadius: "var(--radius)",
                border: "1px solid hsl(var(--destructive) / 0.3)",
                background: "hsl(var(--destructive) / 0.1)",
                color: "hsl(var(--destructive))",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              <LogOut size={16} />
              <span>خروج</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
          {/* Welcome Banner */}
          <div
            style={{
              padding: "1.75rem 2rem",
              borderRadius: "16px",
              background:
                "linear-gradient(135deg, hsl(var(--primary)) 0%, #1e3a8a 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "2rem",
              boxShadow: "0 10px 25px -5px hsl(var(--primary) / 0.3)",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "20px",
                  background: "rgba(255, 255, 255, 0.15)",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  backdropFilter: "blur(4px)",
                }}
              >
                <Sparkles size={14} />
                نظام تشغيل لإدارة الورش والمصانع — مرحباً بك
              </div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 900, marginBottom: "0.375rem" }}>
                أهلاً بك، {user?.name ?? "المدير العام"} 👋
              </h1>
              <p style={{ opacity: 0.9, fontSize: "0.9375rem" }}>
                جميع عمليات الإنتاج والمخازن والمالية تعمل بكفاءة عالية في الفرع الرئيسي.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              {quickActions.map((act, i) => (
                <button
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.25rem",
                    borderRadius: "var(--radius)",
                    border: "none",
                    background: "white",
                    color: "hsl(var(--primary))",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  <act.icon size={18} />
                  <span>{act.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1.25rem",
              marginBottom: "2rem",
            }}
          >
            {stats.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div
                  key={idx}
                  style={{
                    padding: "1.5rem",
                    borderRadius: "16px",
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))", fontWeight: 600 }}>
                      {st.title}
                    </span>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: st.bg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: st.color,
                      }}
                    >
                      <Icon size={22} />
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "1.625rem", fontWeight: 900 }}>
                      {st.value}
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        color: st.isPositive ? "#10b981" : "#ef4444",
                      }}
                    >
                      {st.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      {st.change}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table Section: Recent Work Orders */}
          <div
            style={{
              background: "hsl(var(--card))",
              borderRadius: "16px",
              border: "1px solid hsl(var(--border))",
              padding: "1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 800 }}>
                  أحدث أوامر التشغيل والإنتاج
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "hsl(var(--muted-foreground))" }}>
                  متابعة حالة أوامر العمل الجارية في الورشة والمصنع
                </p>
              </div>

              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  color: "hsl(var(--primary))",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <span>عرض الكل</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid hsl(var(--border))",
                      color: "hsl(var(--muted-foreground))",
                      fontSize: "0.8125rem",
                    }}
                  >
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>رقم الأمر</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>العميل</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>المنتج / الخدمة</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>الحالة</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>التاريخ</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 700 }}>القيمة الإجمالية</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((ord) => (
                    <tr
                      key={ord.id}
                      style={{
                        borderBottom: "1px solid hsl(var(--border) / 0.5)",
                        fontSize: "0.875rem",
                      }}
                    >
                      <td style={{ padding: "1rem", fontWeight: 700, dir: "ltr", textAlign: "right" }}>
                        {ord.id}
                      </td>
                      <td style={{ padding: "1rem", fontWeight: 600 }}>{ord.customer}</td>
                      <td style={{ padding: "1rem", color: "hsl(var(--muted-foreground))" }}>
                        {ord.product}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: ord.statusColor,
                            background: `${ord.statusColor}18`,
                          }}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td style={{ padding: "1rem", color: "hsl(var(--muted-foreground))", fontSize: "0.8125rem" }}>
                        {ord.date}
                      </td>
                      <td style={{ padding: "1rem", fontWeight: 800 }}>{ord.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
