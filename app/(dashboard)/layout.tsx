// ============================================================
// Tashgheel — Dashboard Layout Container
// Pure layout container (redirects are handled by middleware.ts)
// ============================================================

import DashboardLayoutClient from "./layout.client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
