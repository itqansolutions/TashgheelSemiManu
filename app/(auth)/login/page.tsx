"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  LogIn,
  Lock,
  Mail,
  Loader2,
  Building2,
  Wrench,
} from "lucide-react";
import Link from "next/link";

// ─── Validation Schema ────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("البريد الإلكتروني غير صحيح"),
  password: z
    .string()
    .min(1, "كلمة المرور مطلوبة")
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Login Page ───────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message ?? "فشل تسجيل الدخول");
        return;
      }

      toast.success("مرحباً بك! جارٍ تحميل النظام...");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("حدث خطأ في الاتصال. يرجى المحاولة مجدداً.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Background Pattern */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `radial-gradient(circle at 25% 25%, hsl(220 70% 30% / 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, hsl(198 80% 42% / 0.2) 0%, transparent 50%)`,
          pointerEvents: "none",
        }}
      />

      <div className="auth-card animate-scale-in" style={{ position: "relative", zIndex: 1 }}>
        {/* Logo & Brand */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
              marginBottom: "1rem",
              boxShadow: "0 8px 20px hsl(var(--primary) / 0.35)",
            }}
          >
            <Wrench size={32} color="white" />
          </div>

          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 900,
              color: "hsl(var(--foreground))",
              marginBottom: "0.25rem",
            }}
          >
            تشغيل
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "hsl(var(--muted-foreground))",
              fontWeight: 500,
            }}
          >
            نظام إدارة ورش التصنيع
          </p>
        </div>

        {/* Form Header */}
        <div style={{ marginBottom: "1.75rem" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              color: "hsl(var(--foreground))",
              marginBottom: "0.25rem",
            }}
          >
            تسجيل الدخول
          </h2>
          <p style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))" }}>
            أدخل بياناتك للوصول إلى نظامك
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} method="POST">
          {/* Email Field */}
          <div className="form-group" style={{ marginBottom: "1.25rem" }}>
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
                  color: errors.email
                    ? "hsl(var(--destructive))"
                    : "hsl(var(--muted-foreground))",
                  pointerEvents: "none",
                }}
              >
                <Mail size={18} />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                dir="ltr"
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 2.75rem",
                  borderRadius: "var(--radius)",
                  border: `1.5px solid ${errors.email ? "hsl(var(--destructive))" : "hsl(var(--border))"}`,
                  background: "hsl(var(--background))",
                  color: "hsl(var(--foreground))",
                  fontSize: "0.9375rem",
                  direction: "ltr",
                  textAlign: "left",
                  transition: "border-color var(--transition), box-shadow var(--transition)",
                  outline: "none",
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
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group" style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.375rem",
              }}
            >
              <label className="form-label required" htmlFor="password" style={{ marginBottom: 0 }}>
                كلمة المرور
              </label>
              <Link
                href="/forgot-password"
                style={{
                  fontSize: "0.8125rem",
                  color: "hsl(var(--primary))",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                نسيت كلمة المرور؟
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "0.875rem",
                  transform: "translateY(-50%)",
                  color: errors.password
                    ? "hsl(var(--destructive))"
                    : "hsl(var(--muted-foreground))",
                  pointerEvents: "none",
                }}
              >
                <Lock size={18} />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                style={{
                  width: "100%",
                  height: "44px",
                  padding: "0 2.75rem",
                  borderRadius: "var(--radius)",
                  border: `1.5px solid ${errors.password ? "hsl(var(--destructive))" : "hsl(var(--border))"}`,
                  background: "hsl(var(--background))",
                  color: "hsl(var(--foreground))",
                  fontSize: "0.9375rem",
                  direction: "ltr",
                  textAlign: "left",
                  transition: "border-color var(--transition), box-shadow var(--transition)",
                  outline: "none",
                }}
                placeholder="••••••••"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "0.875rem",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "hsl(var(--muted-foreground))",
                  padding: "0.25rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "var(--radius-sm)",
                  transition: "color var(--transition)",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p
                style={{
                  fontSize: "0.8125rem",
                  color: "hsl(var(--destructive))",
                  marginTop: "0.25rem",
                }}
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              marginBottom: "1.75rem",
            }}
          >
            <input
              id="remember"
              type="checkbox"
              style={{
                width: "16px",
                height: "16px",
                cursor: "pointer",
                accentColor: "hsl(var(--primary))",
              }}
              {...register("remember")}
            />
            <label
              htmlFor="remember"
              style={{
                fontSize: "0.875rem",
                color: "hsl(var(--foreground))",
                cursor: "pointer",
                fontWeight: 500,
                userSelect: "none",
              }}
            >
              تذكرني لمدة 7 أيام
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              height: "48px",
              borderRadius: "var(--radius)",
              background: isLoading
                ? "hsl(var(--muted))"
                : "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-light)) 100%)",
              color: isLoading ? "hsl(var(--muted-foreground))" : "white",
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: 700,
              fontFamily: "var(--font-tajawal), system-ui",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "all var(--transition)",
              boxShadow: isLoading ? "none" : "0 4px 12px hsl(var(--primary) / 0.4)",
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                جارٍ تسجيل الدخول...
              </>
            ) : (
              <>
                <LogIn size={20} />
                تسجيل الدخول
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div
          style={{
            marginTop: "2rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid hsl(var(--border))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            color: "hsl(var(--muted-foreground))",
            fontSize: "0.8125rem",
          }}
        >
          <Building2 size={14} />
          <span>تشغيل للتصنيع شبه الآلي © {new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}
