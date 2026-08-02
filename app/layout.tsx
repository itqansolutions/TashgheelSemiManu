// ============================================================
// Tashgheel — Root Layout
// RTL + Arabic + Tajawal Font + Sonner Toasts
// ============================================================

import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import ToastProvider from "@/components/providers/ToastProvider";
import "./globals.css";

// Force all routes to render dynamically at runtime (bypasses static build prerendering)
export const dynamic = "force-dynamic";

// ─── Arabic Font ─────────────────────────────────────────────

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

// ─── Simplified Metadata to avoid React 19 metadata hoisting / key warnings ───

export const metadata: Metadata = {
  title: "تشغيل — نظام إدارة ورش التصنيع",
  description: "نظام متكامل لإدارة ورش وشركات التصنيع شبه الآلي",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1e3a5f",
};

// ─── Root Layout ──────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className="font-tajawal antialiased bg-background text-foreground">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
