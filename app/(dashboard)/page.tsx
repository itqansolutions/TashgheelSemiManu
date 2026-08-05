// ============================================================
// Tashgheel — Dashboard Page (Live Stats)
// ============================================================

import { Metadata } from "next";
import { getCurrentSession } from "@/lib/auth";
import {
  Users, FileText, Wrench, DollarSign,
  TrendingUp, Clock, CheckCircle2, Factory,
  Package, ArrowLeft,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "لوحة التحكم" };

// ─── Types ───────────────────────────────────────────────────

interface DashboardStats {
  totalSales: number;
  activeJobOrders: number;
  itemsCount: number;
  customersCount: number;
  suppliersCount: number;
  quotationsCount: number;
  recentJobOrders: Array<{
    id: string;
    jobNo: string;
    title: string;
    status: string;
    createdAt: string;
    customer?: { name: string } | null;
  }>;
}

// ─── Status helpers ───────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  NEW: "جديد", SURVEYING: "معاينة", QUOTED: "تم تقديم عرض سعر",
  APPROVED: "معتمد", PURCHASING: "شراء خامات", IN_PRODUCTION: "قيد التصنيع",
  IN_FINISHING: "قيد التجهيز", INSTALLING: "قيد التركيب",
  DELIVERED: "تم التسليم", INVOICED: "تم الفوترة", COLLECTED: "تم التحصيل", CLOSED: "مغلق",
};

const STATUS_COLORS: Record<string, string> = {
  NEW: "#64748b", SURVEYING: "#0284c7", QUOTED: "#7c3aed",
  APPROVED: "#16a34a", PURCHASING: "#d97706", IN_PRODUCTION: "#0891b2",
  IN_FINISHING: "#7c3aed", INSTALLING: "#ea580c",
  DELIVERED: "#16a34a", INVOICED: "#0284c7", COLLECTED: "#16a34a", CLOSED: "#64748b",
};

// ─── Stat Card ────────────────────────────────────────────────

function StatCard({
  title, value, subtitle, icon: Icon, color, href,
}: {
  title: string; value: string; subtitle?: string;
  icon: React.ElementType; color: string; href?: string;
}) {
  const Tag = href ? "a" : "div";
  return (
    <Tag
      {...(href ? { href } : {})}
      className="stat-card"
      style={{
        ...(href ? { textDecoration: "none", cursor: "pointer" } : {}),
        display: "block",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: "0.8125rem", fontWeight: 600, color: "hsl(var(--muted-foreground))", marginBottom: "0.25rem" }}>
            {title}
          </p>
          <p style={{ fontSize: "1.75rem", fontWeight: 800, color: "hsl(var(--foreground))", lineHeight: 1.1 }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ fontSize: "0.8125rem", color: "hsl(var(--muted-foreground))", marginTop: "0.25rem" }}>
              {subtitle}
            </p>
          )}
        </div>
        <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-lg)", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </Tag>
  );
}

// ─── Quick Action ─────────────────────────────────────────────

function QuickAction({ label, href, icon: Icon, color }: { label: string; href: string; icon: React.ElementType; color: string }) {
  return (
    <a
      href={href}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", padding: "1rem", borderRadius: "var(--radius-lg)", background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", textDecoration: "none", color: "hsl(var(--foreground))", transition: "box-shadow var(--transition), transform var(--transition)", cursor: "pointer" }}
    >
      <div style={{ width: "48px", height: "48px", borderRadius: "var(--radius-lg)", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={22} style={{ color }} />
      </div>
      <span style={{ fontSize: "0.8125rem", fontWeight: 600, textAlign: "center" }}>{label}</span>
    </a>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────

async function fetchStats(): Promise<DashboardStats | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/dashboard/stats`, { cache: "no-store" });
    const data = await res.json();
    if (data.success) return data.data;
    return null;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const session = await getCurrentSession();
  const stats = await fetchStats();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "صباح الخير";
    if (hour < 17) return "مساء الخير";
    return "مساء النور";
  };

  const statCards = [
    {
      title: "إجمالي المبيعات",
      value: stats ? `${(stats.totalSales).toLocaleString("ar-EG", { maximumFractionDigits: 0 })} ج.م` : "جارٍ التحميل...",
      subtitle: "من الفواتير المُصدَرة",
      icon: DollarSign,
      color: "#059669",
      href: "/sales/invoices",
    },
    {
      title: "العملاء النشطون",
      value: stats ? stats.customersCount.toString() : "—",
      subtitle: `${stats?.suppliersCount ?? 0} مورد نشط`,
      icon: Users,
      color: "#0284c7",
      href: "/customers",
    },
    {
      title: "أوامر التشغيل الجارية",
      value: stats ? stats.activeJobOrders.toString() : "—",
      subtitle: "قيد الإنتاج والتركيب",
      icon: Wrench,
      color: "#7c3aed",
      href: "/workshop/job-orders",
    },
    {
      title: "عروض الأسعار",
      value: stats ? stats.quotationsCount.toString() : "—",
      subtitle: "المُقدَّمة للعملاء",
      icon: FileText,
      color: "#1e3a5f",
      href: "/sales/quotations",
    },
  ];

  const quickActions = [
    { label: "فاتورة جديدة",   href: "/sales/invoices",        icon: FileText, color: "#1e3a5f" },
    { label: "عرض سعر جديد",  href: "/sales/quotations",       icon: FileText, color: "#0284c7" },
    { label: "أمر تشغيل",     href: "/workshop/job-orders",    icon: Wrench,   color: "#7c3aed" },
    { label: "عميل جديد",      href: "/customers",              icon: Users,    color: "#059669" },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.625rem", fontWeight: 900, color: "hsl(var(--foreground))", marginBottom: "0.25rem" }}>
          {greeting()}، {session?.name ?? "بالنظام"} 👋
        </h1>
        <p style={{ color: "hsl(var(--muted-foreground))", fontSize: "0.9375rem" }}>
          مرحباً بك في نظام تشغيل لإدارة ورشة التصنيع
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-xl)", padding: "1.5rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, marginBottom: "1rem", color: "hsl(var(--foreground))" }}>
          إجراءات سريعة
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.75rem" }}>
          {quickActions.map((action) => (
            <QuickAction key={action.href} {...action} />
          ))}
        </div>
      </div>

      {/* Recent Job Orders */}
      {stats?.recentJobOrders && stats.recentJobOrders.length > 0 && (
        <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-xl)", padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, color: "hsl(var(--foreground))" }}>
              أحدث أوامر التشغيل
            </h2>
            <a href="/workshop/job-orders" style={{ fontSize: "0.875rem", color: "hsl(var(--primary))", fontWeight: 700, textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              عرض الكل <ArrowLeft size={14} />
            </a>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {stats.recentJobOrders.slice(0, 5).map((jo) => {
              const color = STATUS_COLORS[jo.status] ?? "#64748b";
              return (
                <div
                  key={jo.id}
                  style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "var(--radius)", background: "hsl(var(--muted) / 0.3)", border: "1px solid hsl(var(--border))" }}
                >
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: "0.9375rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {jo.title}
                    </p>
                    <p style={{ fontSize: "0.8125rem", color: "hsl(var(--muted-foreground))" }}>
                      {jo.customer?.name ?? "—"} · {jo.jobNo}
                    </p>
                  </div>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color, background: `${color}18`, padding: "0.25rem 0.625rem", borderRadius: "999px", flexShrink: 0, whiteSpace: "nowrap" }}>
                    {STATUS_LABELS[jo.status] ?? jo.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!stats || stats.recentJobOrders.length === 0) && (
        <div style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius-xl)", padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.0625rem", fontWeight: 800, marginBottom: "1rem", color: "hsl(var(--foreground))" }}>
            حالة النظام
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "var(--radius)", background: "hsl(var(--success) / 0.08)", border: "1px solid hsl(var(--success) / 0.2)" }}>
            <CheckCircle2 size={18} style={{ color: "hsl(var(--success))", flexShrink: 0 }} />
            <span style={{ fontSize: "0.9375rem", fontWeight: 600 }}>النظام يعمل — ابدأ بإدخال بياناتك الآن ✓</span>
          </div>
        </div>
      )}
    </div>
  );
}
