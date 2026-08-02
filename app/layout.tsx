// ============================================================
// Tashgheel — Root Layout
// RTL + Arabic + Tajawal Font + Sonner Toasts
// ============================================================

import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// ─── Arabic Font ─────────────────────────────────────────────

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
  display: "swap",
});

// ─── Metadata ────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: "تشغيل — نظام إدارة ورش التصنيع",
    template: "%s | تشغيل",
  },
  description:
    "نظام متكامل لإدارة ورش وشركات التصنيع شبه الآلي — عروض الأسعار، الفواتير، أوامر التشغيل، والتقارير",
  keywords: "تشغيل, ورشة, تصنيع, ألوميتال, إدارة, فواتير, محاسبة",
  authors: [{ name: "Tashgheel Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "تشغيل",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    title: "تشغيل — نظام إدارة ورش التصنيع",
    description: "نظام متكامل لإدارة ورش وشركات التصنيع شبه الآلي",
  },
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
        <Toaster
          position="top-center"
          richColors
          closeButton
          dir="rtl"
          toastOptions={{
            style: {
              fontFamily: "var(--font-tajawal)",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
