// ============================================================
// Tashgheel — Dashboard Layout
// Server Component + Client Layout (Force Dynamic Server Render)
// ============================================================

import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import DashboardLayoutClient from "./layout.client";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side session check
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardLayoutClient
      userName={session.name}
      userEmail={session.email}
      userId={session.userId}
      companyId={session.companyId}
    >
      {children}
    </DashboardLayoutClient>
  );
}
