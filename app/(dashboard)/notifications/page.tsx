"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCircle2, Clock, Info, ShieldAlert, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface NotificationItem {
  id: string;
  title: string;
  body?: string | null;
  category: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated system notifications
    setNotifications([
      {
        id: "1",
        title: "مرحباً بك في نظام تشغيل ERP المطور v1.4.0",
        body: "تم تفعيل محرر بنود الأصناف والمواصفات والأبعاد وكشوف الحسابات الرسمية بنجاح.",
        category: "system",
        type: "INFO",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        title: "إعدادات الهوية والبصمة البصرية",
        body: "يمكنك الآن رفع لوجو الورشة واختيار ثيم المطبوعات من صفحة الإعدادات.",
        category: "system",
        type: "SUCCESS",
        isRead: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ]);
    setLoading(false);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success("تم تحديد كافة الإشعارات كمقروءة");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">الإشعارات والتنبيهات</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            متابعة التنبيهات النظامية وأحداث أوامر التشغيل والفواتير
          </p>
        </div>
        <button
          onClick={markAllRead}
          className="px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-muted"
        >
          تحديد الكل كمقروء
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <Bell size={32} className="text-muted-foreground mb-2" />
            <p className="font-bold text-sm">لا توجد إشعارات جديدة</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start gap-3.5 transition-colors ${
                n.isRead ? "bg-card" : "bg-primary/5"
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bell size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm leading-tight">{n.title}</h3>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">
                    {new Date(n.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {n.body && <p className="text-xs text-muted-foreground mt-1">{n.body}</p>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
