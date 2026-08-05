"use client";

import { useState, useEffect } from "react";
import {
  BarChart3, DollarSign, FileText, Wrench, Users,
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Download, Printer, Loader2, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    totalSales: number;
    totalExpenses: number;
    netProfit: number;
    jobOrdersCount: number;
    customersCount: number;
    suppliersCount: number;
  }>({
    totalSales: 0,
    totalExpenses: 0,
    netProfit: 0,
    jobOrdersCount: 0,
    customersCount: 0,
    suppliersCount: 0,
  });

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      try {
        const [resStats, resExp] = await Promise.all([
          fetch("/api/dashboard/stats"),
          fetch("/api/expenses"),
        ]);
        const statsData = await resStats.json();
        const expData = await resExp.json();

        const sales = statsData.data?.totalSales ?? 0;
        const expList = expData.data ?? [];
        const totalExp = expList.reduce((s: number, e: any) => s + Number(e.amount || 0), 0);

        setData({
          totalSales: sales,
          totalExpenses: totalExp,
          netProfit: sales - totalExp,
          jobOrdersCount: statsData.data?.activeJobOrders ?? 0,
          customersCount: statsData.data?.customersCount ?? 0,
          suppliersCount: statsData.data?.suppliersCount ?? 0,
        });
      } catch {
        toast.error("فشل تحميل التقارير المالية");
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const profitMargin =
    data.totalSales > 0 ? ((data.netProfit / data.totalSales) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">التقارير المالية والربحية</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            ملخص الأداء المالي والأرباح والتكاليف الإجمالية للشركة
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-card border border-border rounded-xl font-bold text-sm hover:bg-muted active:scale-95 transition-transform"
        >
          <Printer size={18} />
          <span>طباعة التقرير</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Main Profit Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-bold">
                <span>إجمالي الإيرادات</span>
                <DollarSign size={18} className="text-emerald-500" />
              </div>
              <p className="text-3xl font-black text-emerald-600">
                {data.totalSales.toLocaleString("ar-EG")} ج.م
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowUpRight size={14} className="text-emerald-500" /> من المبيعات والفواتير
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-bold">
                <span>إجمالي المصروفات</span>
                <DollarSign size={18} className="text-destructive" />
              </div>
              <p className="text-3xl font-black text-destructive">
                {data.totalExpenses.toLocaleString("ar-EG")} ج.م
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowDownRight size={14} className="text-destructive" /> التكاليف والمصاريف التشغيلية
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-2">
              <div className="flex items-center justify-between text-muted-foreground text-xs font-bold">
                <span>صافي الأرباح</span>
                <TrendingUp size={18} className="text-primary" />
              </div>
              <p className={`text-3xl font-black ${data.netProfit >= 0 ? "text-primary" : "text-destructive"}`}>
                {data.netProfit.toLocaleString("ar-EG")} ج.م
              </p>
              <p className="text-xs text-muted-foreground font-semibold">
                هامش الربح الإجمالي: <span className="font-extrabold text-foreground">{profitMargin}%</span>
              </p>
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-black">مؤشرات النشاط والعمليات</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Wrench size={22} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">أوامر التشغيل الجارية</p>
                  <p className="text-xl font-extrabold">{data.jobOrdersCount}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Users size={22} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">قاعدة العملاء النشطين</p>
                  <p className="text-xl font-extrabold">{data.customersCount}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <FileText size={22} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">شبكة الموردين</p>
                  <p className="text-xl font-extrabold">{data.suppliersCount}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
