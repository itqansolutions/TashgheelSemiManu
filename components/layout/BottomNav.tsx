"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Wrench,
  BarChart3,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import { useState } from "react";

// ─── Bottom Nav Items ────────────────────────────────────────

const navItems = [
  { label: "الرئيسية",  href: "/dashboard",           icon: LayoutDashboard, exact: true },
  { label: "المبيعات",  href: "/sales/invoices",       icon: FileText },
  { label: "الورشة",    href: "/workshop/job-orders",  icon: Wrench },
  { label: "التقارير",  href: "/reports",              icon: BarChart3 },
  { label: "المزيد",    href: "/settings/company",     icon: MoreHorizontal },
];

// ─── FAB Actions ─────────────────────────────────────────────

const fabActions = [
  { label: "فاتورة جديدة",       href: "/sales/invoices?new=true",       color: "#1e3a5f" },
  { label: "عرض سعر جديد",      href: "/sales/quotations?new=true",     color: "#0284c7" },
  { label: "أمر تشغيل جديد",    href: "/workshop/job-orders?new=true",  color: "#7c3aed" },
  { label: "عميل جديد",         href: "/customers?new=true",            color: "#059669" },
];

// ─── Bottom Navigation ────────────────────────────────────────

export default function BottomNav() {
  const pathname = usePathname();
  const [fabOpen, setFabOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* FAB Action Menu */}
      {fabOpen && (
        <>
          <div
            onClick={() => setFabOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 49,
              background: "rgb(0 0 0 / 0.3)",
              backdropFilter: "blur(2px)",
            }}
          />
          <div
            style={{
              position: "fixed",
              bottom: "calc(var(--bottomnav-height) + 70px)",
              left: "1.25rem",
              zIndex: 51,
              display: "flex",
              flexDirection: "column",
              gap: "0.625rem",
              alignItems: "flex-start",
            }}
          >
            {fabActions.map((action, i) => (
              <Link
                key={action.href}
                href={action.href}
                onClick={() => setFabOpen(false)}
                className="animate-slide-in"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.625rem 1rem",
                  borderRadius: "9999px",
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  boxShadow: "var(--shadow-lg)",
                  color: "hsl(var(--foreground))",
                  textDecoration: "none",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  animationDelay: `${i * 50}ms`,
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: action.color,
                    flexShrink: 0,
                  }}
                />
                {action.label}
              </Link>
            ))}
          </div>
        </>
      )}

      {/* FAB Button */}
      <button
        onClick={() => setFabOpen(!fabOpen)}
        className="fab"
        aria-label="إضافة سريعة"
        style={{
          transform: fabOpen ? "rotate(45deg) scale(1.05)" : "rotate(0deg) scale(1)",
        }}
      >
        <Plus size={26} />
      </button>

      {/* Bottom Navigation Bar */}
      <nav className="bottom-nav">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bottom-nav-item ${active ? "active" : ""}`}
            >
              <item.icon
                size={22}
                style={{
                  strokeWidth: active ? 2.5 : 1.75,
                }}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
