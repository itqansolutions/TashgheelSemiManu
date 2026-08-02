// ============================================================
// Tashgheel — Dashboard Page
// Dynamic based on user role & permissions
// ============================================================

import { Metadata } from "next";
import { getCurrentSession } from "@/lib/auth";
import {
  Users,
  FileText,
  Wrench,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "لوحة التحكم",
};

// ─── Stat Card ───────────────────────────────────────────────

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="stat-card">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "hsl(var(--muted-foreground))",
              marginBottom: "0.25rem",
            }}
          >
            {title}
          </p>
          <p
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "hsl(var(--foreground))",
              lineHeight: 1.1,
            }}
          >
            {value}
          </p>
          {subtitle && (
            <p
              style={{
                fontSize: "0.8125rem",
                color: "hsl(var(--muted-foreground))",
                marginTop: "0.25rem",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "var(--radius-lg)",
            background: `${color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={24} style={{ color }} />
        </div>
      </div>
      {trend && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            marginTop: "0.5rem",
            fontSize: "0.8125rem",
            color: trend.positive ? "hsl(var(--success))" : "hsl(var(--destructive))",
            fontWeight: 600,
          }}
        >
          <TrendingUp size={14} style={{ transform: trend.positive ? "none" : "scaleY(-1)" }} />
          <span>{trend.value} هذا الشهر</span>
        </div>
      )}
    </div>
  );
}

// ─── Quick Action ─────────────────────────────────────────────

function QuickAction({
  label,
  href,
  icon: Icon,
  color,
}: {
  label: string;
  href: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <a
      href={href}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
        padding: "1rem",
        borderRadius: "var(--radius-lg)",
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        textDecoration: "none",
        color: "hsl(var(--foreground))",
        transition: "box-shadow var(--transition), transform var(--transition)",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
        (e.currentTarget as HTMLElement).style.transform = "none";
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "var(--radius-lg)",
          background: `${color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <span style={{ fontSize: "0.8125rem", fontWeight: 600, textAlign: "center" }}>
        {label}
      </span>
    </a>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────

export default async function DashboardPage() {
  const session = await getCurrentSession();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "صباح الخير";
    if (hour < 17) return "مساء الخير";
    return "مساء النور";
  };

  // TODO: Fetch real data from DB based on permissions
  const stats = [
    {
      title: "إجمالي الفواتير (هذا الشهر)",
      value: "٠",
      subtitle: "جارٍ التحميل...",
      icon: FileText,
      color: "#1e3a5f",
      trend: { value: "—", positive: true },
    },
    {
      title: "العملاء النشطون",
      value: "٠",
      subtitle: "جارٍ التحميل...",
      icon: Users,
      color: "#0284c7",
    },
    {
      title: "أوامر التشغيل الجارية",
      value: "٠",
      subtitle: "جارٍ التحميل...",
      icon: Wrench,
      color: "#7c3aed",
    },
    {
      title: "إجمالي المتحصلات",
      value: "٠ ج.م",
      subtitle: "جارٍ التحميل...",
      icon: DollarSign,
      color: "#059669",
      trend: { value: "—", positive: true },
    },
  ];

  const quickActions = [
    { label: "فاتورة جديدة",     href: "/sales/invoices/new",       icon: FileText, color: "#1e3a5f" },
    { label: "عرض سعر جديد",    href: "/sales/quotations/new",     icon: FileText, color: "#0284c7" },
    { label: "أمر تشغيل",       href: "/workshop/job-orders/new",  icon: Wrench,   color: "#7c3aed" },
    { label: "عميل جديد",        href: "/customers/new",            icon: Users,    color: "#059669" },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.625rem",
            fontWeight: 900,
            color: "hsl(var(--foreground))",
            marginBottom: "0.25rem",
          }}
        >
          {greeting()}، {session?.name ?? "بالنظام"} 👋
        </h1>
        <p style={{ color: "hsl(var(--muted-foreground))", fontSize: "0.9375rem" }}>
          مرحباً بك في نظام تشغيل لإدارة ورشة التصنيع
        </p>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div
        style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-xl)",
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.0625rem",
            fontWeight: 800,
            marginBottom: "1rem",
            color: "hsl(var(--foreground))",
          }}
        >
          إجراءات سريعة
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {quickActions.map((action) => (
            <QuickAction key={action.href} {...action} />
          ))}
        </div>
      </div>

      {/* Status Alerts */}
      <div
        style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-xl)",
          padding: "1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.0625rem",
            fontWeight: 800,
            marginBottom: "1rem",
            color: "hsl(var(--foreground))",
          }}
        >
          حالة النظام
        </h2>

        {/* Setup Progress */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius)",
              background: "hsl(var(--success) / 0.08)",
              border: "1px solid hsl(var(--success) / 0.2)",
            }}
          >
            <CheckCircle2 size={18} style={{ color: "hsl(var(--success))", flexShrink: 0 }} />
            <span style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
              النظام يعمل بشكل صحيح ✓
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius)",
              background: "hsl(var(--warning) / 0.08)",
              border: "1px solid hsl(var(--warning) / 0.2)",
            }}
          >
            <AlertCircle size={18} style={{ color: "hsl(var(--warning))", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                يرجى إكمال إعدادات الشركة
              </div>
              <div style={{ fontSize: "0.8125rem", color: "hsl(var(--muted-foreground))" }}>
                أضف بيانات شركتك ولوجو وبيانات التواصل
              </div>
            </div>
            <a
              href="/settings/company"
              style={{
                marginRight: "auto",
                padding: "0.375rem 0.875rem",
                borderRadius: "var(--radius)",
                background: "hsl(var(--warning))",
                color: "hsl(var(--warning-foreground))",
                fontSize: "0.8125rem",
                fontWeight: 700,
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              اكتمل الآن
            </a>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius)",
              background: "hsl(var(--info) / 0.08)",
              border: "1px solid hsl(var(--info) / 0.2)",
            }}
          >
            <Clock size={18} style={{ color: "hsl(var(--info))", flexShrink: 0 }} />
            <span style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
              Phase 0 مكتمل — جارٍ إعداد البيانات الأساسية
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
