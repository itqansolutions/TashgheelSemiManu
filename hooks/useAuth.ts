// ============================================================
// Tashgheel — Hooks: useAuth
// Client-side hook for authentication state
// ============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  company: string;
  companyId: string;
  avatar?: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      toast.success("تم تسجيل الخروج بنجاح");
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("حدث خطأ أثناء تسجيل الخروج");
    }
  }, [router]);

  const refresh = useCallback(async () => {
    await fetchMe();
  }, [fetchMe]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refresh,
  };
}
