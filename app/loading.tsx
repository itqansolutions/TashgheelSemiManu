import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        color: "hsl(var(--muted-foreground))",
      }}
    >
      <Loader2 size={36} className="animate-spin text-primary" style={{ color: "hsl(var(--primary))" }} />
      <span style={{ fontWeight: 600, fontSize: "0.9375rem" }}>جارٍ التحميل...</span>
    </div>
  );
}
