"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, ArrowRight, Loader2, Wrench, CheckCircle } from "lucide-react";
import Link from "next/link";

const schema = z.object({
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("البريد الإلكتروني غير صحيح"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message ?? "حدث خطأ أثناء الإرسال");
        return;
      }

      setIsSent(true);
      toast.success("تم إرسال رابط إعادة الضبط بنجاح");
    } catch {
      toast.error("تعذر الاتصال بالخادم");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div
        className="auth-card animate-scale-in"
        style={{ position: "relative", zIndex: 1, maxWidth: "440px" }}
      >
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "18px",
              background:
                "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
              marginBottom: "1rem",
            }}
          >
            <Wrench size={28} color="white" />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 900 }}>
            استعادة كلمة المرور
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "hsl(var(--muted-foreground))",
              marginTop: "0.25rem",
            }}
          >
            أدخل بريدك الإلكتروني لإرسال تعليمات إعادة التعادل
          </p>
        </div>

        {isSent ? (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "hsl(var(--primary) / 0.1)",
                color: "hsl(var(--primary))",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1rem",
              }}
            >
              <CheckCircle size={32} />
            </div>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
              }}
            >
              تم إرسال الرابط!
            </h3>
            <p
              style={{
                fontSize: "0.875rem",
                color: "hsl(var(--muted-foreground))",
                marginBottom: "1.5rem",
              }}
            >
              يرجى مراجعة صندوق البريد الإلكتروني واتباع التعليمات المرسلة.
            </p>
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "hsl(var(--primary))",
                textDecoration: "none",
              }}
            >
              <ArrowRight size={16} />
              العودة لتسجيل الدخول
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label className="form-label required" htmlFor="email">
                البريد الإلكتروني
              </label>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "0.875rem",
                    transform: "translateY(-50%)",
                    color: "hsl(var(--muted-foreground))",
                    pointerEvents: "none",
                  }}
                >
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  dir="ltr"
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "0 2.75rem",
                    borderRadius: "var(--radius)",
                    border: "1.5px solid hsl(var(--border))",
                    background: "hsl(var(--background))",
                    color: "hsl(var(--foreground))",
                    fontSize: "0.9375rem",
                  }}
                  placeholder="example@company.com"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p
                  style={{
                    fontSize: "0.8125rem",
                    color: "hsl(var(--destructive))",
                    marginTop: "0.25rem",
                  }}
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                height: "44px",
                borderRadius: "var(--radius)",
                background: "hsl(var(--primary))",
                color: "white",
                border: "none",
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: "1.25rem",
              }}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "إرسال رابط إعادة التعين"
              )}
            </button>

            <div style={{ textAlign: "center" }}>
              <Link
                href="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                  color: "hsl(var(--muted-foreground))",
                  textDecoration: "none",
                }}
              >
                <ArrowRight size={16} />
                العودة لتسجيل الدخول
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
