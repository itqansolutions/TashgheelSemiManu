"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  FileText,
  Wrench,
  ShoppingCart,
  X,
  Loader2,
  ArrowLeft,
  Hash,
} from "lucide-react";

// ─── Search Result Types ──────────────────────────────────────

interface SearchResult {
  id: string;
  entityType: string;
  title: string;
  subtitle?: string;
  route: string;
}

const entityIcons: Record<string, React.ElementType> = {
  customer: Users,
  supplier: Users,
  invoice: FileText,
  quotation: FileText,
  job_order: Wrench,
  purchase_invoice: ShoppingCart,
  purchase_order: ShoppingCart,
};

const entityLabels: Record<string, string> = {
  customer:         "عميل",
  supplier:         "مورد",
  invoice:          "فاتورة",
  quotation:        "عرض سعر",
  job_order:        "أمر تشغيل",
  purchase_invoice: "فاتورة مشتريات",
  purchase_order:   "أمر شراء",
};

// ─── Quick Links ──────────────────────────────────────────────

const quickLinks = [
  { label: "العملاء",          route: "/customers",             icon: Users },
  { label: "الفواتير",          route: "/sales/invoices",        icon: FileText },
  { label: "عروض الأسعار",     route: "/sales/quotations",      icon: FileText },
  { label: "أوامر التشغيل",    route: "/workshop/job-orders",   icon: Wrench },
  { label: "المشتريات",         route: "/purchasing",            icon: ShoppingCart },
];

// ─── Global Search Component ──────────────────────────────────

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  companyId?: string;
}

export default function GlobalSearch({ isOpen, onClose, companyId }: GlobalSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Search function
  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim() || q.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(q)}&companyId=${companyId}`
        );
        const data = await res.json();
        setResults(data.data ?? []);
        setSelectedIndex(0);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [companyId]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const total = results.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % total);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + total) % total);
    } else if (e.key === "Enter" && results[selectedIndex]) {
      navigateTo(results[selectedIndex].route);
    }
  };

  const navigateTo = (route: string) => {
    router.push(route);
    onClose();
  };

  if (!isOpen) return null;

  const showResults = query.length >= 2;
  const showEmpty = showResults && !isLoading && results.length === 0;

  return (
    <div className="command-overlay" onClick={onClose}>
      <div
        className="command-box animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{ margin: "0 1rem" }}
      >
        {/* Search Input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "1rem 1.25rem",
            borderBottom: "1px solid hsl(var(--border))",
          }}
        >
          {isLoading ? (
            <Loader2 size={20} style={{ color: "hsl(var(--primary))", flexShrink: 0 }} className="animate-spin" />
          ) : (
            <Search size={20} style={{ color: "hsl(var(--muted-foreground))", flexShrink: 0 }} />
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ابحث عن عميل، فاتورة، رقم موبايل، أمر تشغيل..."
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              fontSize: "1rem",
              color: "hsl(var(--foreground))",
              fontFamily: "var(--font-tajawal), system-ui",
              direction: "rtl",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius-sm)",
                padding: "2px 6px",
                fontSize: "0.75rem",
                color: "hsl(var(--muted-foreground))",
                cursor: "pointer",
              }}
            >
              ESC
            </button>
          </div>
        </div>

        {/* Results / Quick Links */}
        <div style={{ maxHeight: "420px", overflowY: "auto" }}>
          {/* Quick Links (when no query) */}
          {!showResults && (
            <div style={{ padding: "0.75rem 0.625rem" }}>
              <div
                style={{
                  padding: "0.25rem 0.625rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "hsl(var(--muted-foreground))",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "0.25rem",
                }}
              >
                روابط سريعة
              </div>
              {quickLinks.map((link) => (
                <button
                  key={link.route}
                  onClick={() => navigateTo(link.route)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.625rem 0.75rem",
                    borderRadius: "var(--radius)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "hsl(var(--foreground))",
                    fontFamily: "var(--font-tajawal), system-ui",
                    fontSize: "0.9375rem",
                    textAlign: "right",
                    transition: "background-color var(--transition)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "hsl(var(--muted))")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <link.icon size={18} style={{ color: "hsl(var(--primary))", flexShrink: 0 }} />
                  <span>{link.label}</span>
                  <ArrowLeft size={16} style={{ marginRight: "auto", color: "hsl(var(--muted-foreground))", transform: "scaleX(-1)" }} />
                </button>
              ))}
            </div>
          )}

          {/* Search Results */}
          {showResults && results.length > 0 && (
            <div style={{ padding: "0.75rem 0.625rem" }}>
              <div
                style={{
                  padding: "0.25rem 0.625rem",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "hsl(var(--muted-foreground))",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginBottom: "0.25rem",
                }}
              >
                النتائج ({results.length})
              </div>
              {results.map((result, index) => {
                const Icon = entityIcons[result.entityType] ?? Hash;
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={result.id}
                    onClick={() => navigateTo(result.route)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.625rem 0.75rem",
                      borderRadius: "var(--radius)",
                      background: isSelected ? "hsl(var(--muted))" : "none",
                      border: "none",
                      cursor: "pointer",
                      color: "hsl(var(--foreground))",
                      fontFamily: "var(--font-tajawal), system-ui",
                      fontSize: "0.9375rem",
                      textAlign: "right",
                      transition: "background-color var(--transition)",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "var(--radius)",
                        background: "hsl(var(--primary) / 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} style={{ color: "hsl(var(--primary))" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {result.title}
                      </div>
                      {result.subtitle && (
                        <div
                          style={{
                            fontSize: "0.8125rem",
                            color: "hsl(var(--muted-foreground))",
                          }}
                        >
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "2px 8px",
                        borderRadius: "9999px",
                        background: "hsl(var(--secondary))",
                        color: "hsl(var(--muted-foreground))",
                        flexShrink: 0,
                      }}
                    >
                      {entityLabels[result.entityType] ?? result.entityType}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {showEmpty && (
            <div className="empty-state" style={{ padding: "2rem" }}>
              <Search size={32} style={{ color: "hsl(var(--muted-foreground))" }} />
              <div style={{ fontWeight: 600 }}>لا توجد نتائج</div>
              <div style={{ fontSize: "0.875rem" }}>
                لم يتم العثور على نتائج لـ &quot;{query}&quot;
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "0.625rem 1.25rem",
            borderTop: "1px solid hsl(var(--border))",
            display: "flex",
            gap: "1rem",
            fontSize: "0.75rem",
            color: "hsl(var(--muted-foreground))",
          }}
        >
          <span>↑↓ للتنقل</span>
          <span>Enter للفتح</span>
          <span>ESC للإغلاق</span>
        </div>
      </div>
    </div>
  );
}
