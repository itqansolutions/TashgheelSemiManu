"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Truck,
  Package,
  Wrench,
  FileText,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronLeft,
  X,
  Building2,
} from "lucide-react";

// ─── Navigation Structure ────────────────────────────────────

const navigation = [
  {
    label: "الرئيسية",
    icon: LayoutDashboard,
    href: "/",
    exact: true,
  },
  {
    label: "البيانات الأساسية",
    icon: Package,
    children: [
      { label: "العملاء",    href: "/customers",     icon: Users },
      { label: "الموردون",   href: "/suppliers",     icon: Truck },
      { label: "الأصناف",    href: "/items",         icon: Package },
      { label: "الخدمات",    href: "/services",      icon: Wrench },
      { label: "الخزائن",    href: "/finance/cash-accounts", icon: DollarSign },
    ],
  },
  {
    label: "المبيعات",
    icon: FileText,
    children: [
      { label: "عروض الأسعار", href: "/sales/quotations", icon: FileText },
      { label: "الفواتير",      href: "/sales/invoices",   icon: FileText },
      { label: "سندات القبض",  href: "/sales/receipts",   icon: DollarSign },
    ],
  },
  {
    label: "المشتريات",
    icon: ShoppingCart,
    children: [
      { label: "أوامر الشراء",   href: "/purchasing/purchase-orders",   icon: ShoppingCart },
      { label: "فواتير الشراء",  href: "/purchasing/purchase-invoices", icon: FileText },
      { label: "سندات الصرف",   href: "/purchasing/payment-vouchers",  icon: DollarSign },
    ],
  },
  {
    label: "ورشة التشغيل",
    icon: Wrench,
    children: [
      { label: "أوامر التشغيل",  href: "/workshop/job-orders", icon: Wrench },
    ],
  },
  {
    label: "المالية",
    icon: DollarSign,
    children: [
      { label: "التكلفة والربحية", href: "/finance/costing",  icon: BarChart3 },
      { label: "المصروفات",        href: "/expenses",          icon: DollarSign },
    ],
  },
  {
    label: "التقارير",
    icon: BarChart3,
    href: "/reports",
  },
  {
    label: "الإعدادات",
    icon: Settings,
    href: "/settings/company",
  },
];

// ─── Sidebar Props ───────────────────────────────────────────

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  companyName?: string;
}

// ─── Sidebar Component ───────────────────────────────────────

export default function Sidebar({ isOpen, onClose, companyName }: SidebarProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<string[]>(["المبيعات"]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const isGroupActive = (children?: Array<{ href: string }>) => {
    return children?.some((c) => pathname.startsWith(c.href)) ?? false;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden"
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgb(0 0 0 / 0.5)",
            zIndex: 39,
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className="sidebar"
        style={{
          transform: isOpen ? "translateX(0)" : undefined,
        }}
      >
        {/* Logo Area */}
        <div
          style={{
            padding: "1.25rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid hsl(var(--sidebar-border))",
            minHeight: "var(--topbar-height)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, hsl(var(--accent)) 0%, hsl(var(--primary-light)) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Wrench size={18} color="white" />
            </div>
            <div>
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: "white",
                  lineHeight: 1.2,
                }}
              >
                تشغيل
              </div>
              {companyName && (
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "hsl(var(--sidebar-text) / 0.7)",
                    lineHeight: 1.2,
                    marginTop: "1px",
                    maxWidth: "160px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {companyName}
                </div>
              )}
            </div>
          </div>

          {/* Close button (mobile) */}
          <button
            onClick={onClose}
            className="md:hidden"
            style={{
              background: "none",
              border: "none",
              color: "hsl(var(--sidebar-text))",
              cursor: "pointer",
              padding: "0.25rem",
              borderRadius: "var(--radius-sm)",
              display: "flex",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <nav
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0.75rem 0.625rem",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {navigation.map((item) => {
            if (item.href && !item.children) {
              // Single Link
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${active ? "active" : ""}`}
                  onClick={onClose}
                >
                  <item.icon size={18} style={{ flexShrink: 0 }} />
                  <span>{item.label}</span>
                </Link>
              );
            }

            // Group with children
            const groupActive = isGroupActive(item.children);
            const isGroupOpen = openGroups.includes(item.label);

            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleGroup(item.label)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.625rem 1rem",
                    borderRadius: "var(--radius)",
                    background: groupActive ? "hsl(var(--sidebar-hover))" : "none",
                    border: "none",
                    cursor: "pointer",
                    color: groupActive ? "white" : "hsl(var(--sidebar-text))",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    fontFamily: "var(--font-tajawal), system-ui",
                    textAlign: "right",
                    transition: "background-color var(--transition)",
                  }}
                >
                  <item.icon size={18} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  <ChevronDown
                    size={16}
                    style={{
                      transition: "transform var(--transition)",
                      transform: isGroupOpen ? "rotate(180deg)" : "rotate(0deg)",
                      flexShrink: 0,
                    }}
                  />
                </button>

                {isGroupOpen && item.children && (
                  <div
                    style={{
                      paddingRight: "1.25rem",
                      paddingTop: "2px",
                      paddingBottom: "4px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1px",
                    }}
                  >
                    {item.children.map((child) => {
                      const childActive = isActive(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`sidebar-link ${childActive ? "active" : ""}`}
                          onClick={onClose}
                          style={{ fontSize: "0.875rem", padding: "0.5rem 0.875rem" }}
                        >
                          <div
                            style={{
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              background: childActive ? "white" : "hsl(var(--sidebar-text) / 0.5)",
                              flexShrink: 0,
                            }}
                          />
                          <span>{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom User Area */}
        <div
          style={{
            padding: "0.75rem 0.625rem",
            borderTop: "1px solid hsl(var(--sidebar-border))",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 0.875rem",
              borderRadius: "var(--radius)",
              color: "hsl(var(--sidebar-text) / 0.7)",
              fontSize: "0.8rem",
            }}
          >
            <Building2 size={14} />
            <span>الإصدار 1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
