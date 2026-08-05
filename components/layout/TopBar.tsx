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
    <header className="topbar print:hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="md:hidden flex items-center justify-center p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
        aria-label="فتح القائمة"
      >
        <Menu size={22} />
      </button>

      {/* Search Bar — Compact & Truncated for Mobile */}
      <button
        onClick={onSearchOpen}
        className="flex-1 max-w-[360px] h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl border border-border bg-background flex items-center gap-2 text-xs sm:text-sm text-muted-foreground transition-all hover:border-primary focus:outline-none overflow-hidden"
        aria-label="بحث عالمي"
      >
        <Search size={16} className="flex-shrink-0 text-muted-foreground" />
        <span className="flex-1 text-right truncate font-medium">
          <span className="hidden sm:inline">ابحث عن عميل، فاتورة، أمر تشغيل...</span>
          <span className="sm:hidden">بحث سريع...</span>
        </span>
        <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-border text-[10px] text-muted-foreground flex-shrink-0">
          <Command size={10} />
          <span>K</span>
        </div>
      </button>

      {/* Right Actions */}
      <div className="flex items-center gap-1 sm:gap-2 mr-auto flex-shrink-0">
        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-foreground hover:bg-muted transition-colors"
          aria-label="الإشعارات"
        >
          <Bell size={19} />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center border-2 border-card">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </Link>

        {/* Divider */}
        <div className="w-[1px] h-6 bg-border mx-0.5 sm:mx-1" />

        {/* User Menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-muted transition-colors text-foreground focus:outline-none"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0 shadow-sm">
              {userName.charAt(0)}
            </div>
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs sm:text-sm font-bold leading-tight truncate max-w-[120px]">
                {userName}
              </span>
              {userRole && (
                <span className="text-[11px] text-muted-foreground leading-tight truncate max-w-[120px]">
                  {userRole}
                </span>
              )}
            </div>
            <ChevronDown
              size={15}
              className={`text-muted-foreground transition-transform duration-200 ${
                userMenuOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {userMenuOpen && (
            <div className="animate-scale-in absolute top-full left-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
              {/* User Info */}
              <div className="p-3 border-b border-border">
                <div className="text-sm font-bold text-foreground">{userName}</div>
                {userRole && (
                  <div className="text-xs text-muted-foreground">{userRole}</div>
                )}
              </div>

              {/* Menu Items */}
              <div className="p-1.5 space-y-0.5">
                <Link
                  href="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <User size={16} />
                  <span>الملف الشخصي</span>
                </Link>

                <Link
                  href="/settings/company"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Settings size={16} />
                  <span>الإعدادات</span>
                </Link>

                <div className="h-[1px] bg-border my-1" />

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm text-destructive hover:bg-destructive/10 transition-colors font-bold text-right"
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
