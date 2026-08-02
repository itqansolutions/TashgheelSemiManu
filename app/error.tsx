"use client";

import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          background: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "var(--radius-xl)",
          padding: "2.5rem",
          maxWidth: "480px",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "hsl(var(--destructive) / 0.1)",
            color: "hsl(var(--destructive))",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1rem",
          }}
        >
          <AlertTriangle size={28} />
        </div>
        <h2 style={{ fontSize: "1.375rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          حدث خطأ أثناء تحميل الصفحة
        </h2>
        <p style={{ color: "hsl(var(--muted-foreground))", marginBottom: "1.5rem", fontSize: "0.9375rem" }}>
          {error?.message || "عذراً، حدث خطأ غير متوقع. يرجى المحاولة مجدداً."}
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button
            onClick={() => reset()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1.25rem",
              borderRadius: "var(--radius)",
              background: "hsl(var(--primary))",
              color: "white",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontSize: "0.9375rem",
            }}
          >
            <RefreshCw size={16} />
            إعادة المحاولة
          </button>
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1.25rem",
              borderRadius: "var(--radius)",
              background: "hsl(var(--secondary))",
              color: "hsl(var(--secondary-foreground))",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: "0.9375rem",
            }}
          >
            <Home size={16} />
            الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}
