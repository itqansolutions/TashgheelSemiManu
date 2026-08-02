import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "الصفحة غير موجودة — 404",
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "hsl(var(--background))",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "8rem",
            fontWeight: 900,
            color: "hsl(var(--primary) / 0.15)",
            lineHeight: 1,
            marginBottom: "1rem",
          }}
        >
          ٤٠٤
        </div>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            color: "hsl(var(--foreground))",
            marginBottom: "0.5rem",
          }}
        >
          الصفحة غير موجودة
        </h1>
        <p
          style={{
            color: "hsl(var(--muted-foreground))",
            marginBottom: "2rem",
            fontSize: "1rem",
          }}
        >
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها
        </p>
        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.75rem",
            borderRadius: "var(--radius)",
            background: "hsl(var(--primary))",
            color: "white",
            fontWeight: 700,
            textDecoration: "none",
            fontSize: "1rem",
          }}
        >
          العودة للرئيسية
        </a>
      </div>
    </div>
  );
}
