"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Menu,
  Bell,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Search,
  Command,
} from "lucide-react";

// ─── Props ───────────────────────────────────────────────────

interface TopBarProps {
  onMenuClick: () => void;
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  companyName?: string;
  notificationCount?: number;
  onSearchOpen?: () => void;
}

// ─── TopBar Component ────────────────────────────────────────

export default function TopBar({
  onMenuClick,
  userName = "المستخدم",
  userRole = "",
  companyName = "تشغيل",
  notificationCount = 0,
  onSearchOpen,
}: TopBarProps) {
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        onSearchOpen?.();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onSearchOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("تم تسجيل الخروج بنجاح");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="topbar">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="md:hidden"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "hsl(var(--foreground))",
          padding: "0.5rem",
          borderRadius: "var(--radius)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background-color var(--transition)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "hsl(var(--muted))")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
        aria-label="فتح القائمة"
      >
        <Menu size={22} />
      </button>

      {/* Search Bar */}
      <button
        onClick={onSearchOpen}
        style={{
          flex: 1,
          maxWidth: "400px",
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
          padding: "0.5rem 0.875rem",
          borderRadius: "var(--radius)",
          border: "1.5px solid hsl(var(--border))",
          background: "hsl(var(--background))",
          cursor: "pointer",
          color: "hsl(var(--muted-foreground))",
          fontSize: "0.875rem",
          textAlign: "right",
          fontFamily: "var(--font-tajawal), system-ui",
          transition: "border-color var(--transition), box-shadow var(--transition)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--primary))";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px hsl(var(--primary) / 0.08)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--border))";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
        aria-label="بحث عالمي"
      >
        <Search size={16} />
        <span style={{ flex: 1 }}>ابحث عن عميل، فاتورة، أمر تشغيل...</span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            padding: "2px 6px",
            borderRadius: "4px",
            border: "1px solid hsl(var(--border))",
            fontSize: "0.6875rem",
            color: "hsl(var(--muted-foreground))",
            flexShrink: 0,
          }}
        >
          <Command size={10} />
          <span>K</span>
        </div>
      </button>

      {/* Right Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginRight: "auto" }}>
        {/* Notifications */}
        <Link
          href="/notifications"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "var(--radius)",
            color: "hsl(var(--foreground))",
            transition: "background-color var(--transition)",
            textDecoration: "none",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "hsl(var(--muted))")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
          aria-label="الإشعارات"
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "6px",
                left: "6px",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: "hsl(var(--destructive))",
                color: "white",
                fontSize: "0.625rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid hsl(var(--card))",
              }}
            >
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </Link>

        {/* Divider */}
        <div
          style={{
            width: "1px",
            height: "24px",
            background: "hsl(var(--border))",
            margin: "0 0.25rem",
          }}
        />

        {/* User Menu */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.375rem 0.625rem",
              borderRadius: "var(--radius)",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "hsl(var(--foreground))",
              fontFamily: "var(--font-tajawal), system-ui",
              transition: "background-color var(--transition)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "hsl(var(--muted))")
            }
            onMouseLeave={(e) => {
              if (!userMenuOpen)
                e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "0.875rem",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {userName.charAt(0)}
            </div>
            <div
              className="hidden-mobile"
              style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}
            >
              <span style={{ fontSize: "0.875rem", fontWeight: 700, lineHeight: 1.2 }}>
                {userName}
              </span>
              {userRole && (
                <span
                  style={{
                    fontSize: "0.6875rem",
                    color: "hsl(var(--muted-foreground))",
                    lineHeight: 1.2,
                  }}
                >
                  {userRole}
                </span>
              )}
            </div>
            <ChevronDown
              size={16}
              style={{
                color: "hsl(var(--muted-foreground))",
                transition: "transform var(--transition)",
                transform: userMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          {/* Dropdown Menu */}
          {userMenuOpen && (
            <div
              className="animate-scale-in"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                minWidth: "200px",
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius-lg)",
                boxShadow: "var(--shadow-lg)",
                overflow: "hidden",
                zIndex: 50,
              }}
            >
              {/* User Info */}
              <div
                style={{
                  padding: "0.875rem 1rem",
                  borderBottom: "1px solid hsl(var(--border))",
                }}
              >
                <div style={{ fontSize: "0.9375rem", fontWeight: 700 }}>{userName}</div>
                {userRole && (
                  <div style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
                    {userRole}
                  </div>
                )}
              </div>

              {/* Menu Items */}
              <div style={{ padding: "0.375rem" }}>
                <Link
                  href="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    padding: "0.625rem 0.75rem",
                    borderRadius: "var(--radius)",
                    color: "hsl(var(--foreground))",
                    textDecoration: "none",
                    fontSize: "0.9375rem",
                    transition: "background-color var(--transition)",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor = "hsl(var(--muted))")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")
                  }
                >
                  <User size={16} />
                  <span>الملف الشخصي</span>
                </Link>

                <Link
                  href="/settings/company"
                  onClick={() => setUserMenuOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    padding: "0.625rem 0.75rem",
                    borderRadius: "var(--radius)",
                    color: "hsl(var(--foreground))",
                    textDecoration: "none",
                    fontSize: "0.9375rem",
                    transition: "background-color var(--transition)",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor = "hsl(var(--muted))")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor = "transparent")
                  }
                >
                  <Settings size={16} />
                  <span>الإعدادات</span>
                </Link>

                <div
                  style={{
                    height: "1px",
                    background: "hsl(var(--border))",
                    margin: "0.375rem 0",
                  }}
                />

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    padding: "0.625rem 0.75rem",
                    borderRadius: "var(--radius)",
                    color: "hsl(var(--destructive))",
                    background: "none",
                    border: "none",
                    cursor: isLoggingOut ? "wait" : "pointer",
                    fontSize: "0.9375rem",
                    fontFamily: "var(--font-tajawal), system-ui",
                    textAlign: "right",
                    transition: "background-color var(--transition)",
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "hsl(var(--destructive) / 0.08)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <LogOut size={16} />
                  <span>{isLoggingOut ? "جارٍ الخروج..." : "تسجيل الخروج"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
