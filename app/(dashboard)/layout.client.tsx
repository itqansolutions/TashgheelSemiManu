"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import GlobalSearch from "@/components/global/GlobalSearch";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
  userId?: string;
  companyId?: string;
}

export default function DashboardLayoutClient({
  children,
  userName,
  companyId,
}: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useAuth();

  const finalUserName = userName || user?.name || "المستخدم";
  const finalCompanyName = user?.company || "تشغيل للتصنيع";
  const finalCompanyId = companyId || user?.companyId;

  return (
    <div style={{ minHeight: "100vh", background: "hsl(var(--background))" }}>
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        companyName={finalCompanyName}
      />

      {/* TopBar */}
      <TopBar
        onMenuClick={() => setSidebarOpen(true)}
        userName={finalUserName}
        onSearchOpen={() => setSearchOpen(true)}
      />

      {/* Main Content */}
      <main className="main-content">
        <div className="animate-fade-in">{children}</div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <BottomNav />

      {/* Global Search (Command Palette) */}
      <GlobalSearch
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        companyId={finalCompanyId}
      />
    </div>
  );
}
