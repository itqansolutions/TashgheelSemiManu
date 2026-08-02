// ============================================================
// Tashgheel — Utility Functions
// ============================================================

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── Tailwind Class Merger ───────────────────────────────────

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ─── Arabic Number Formatting ────────────────────────────────

export function formatCurrency(
  amount: number | string | null | undefined,
  currency = "EGP",
  locale = "ar-EG"
): string {
  const num = Number(amount ?? 0);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatNumber(
  value: number | string | null | undefined,
  decimals = 2
): string {
  const num = Number(value ?? 0);
  return new Intl.NumberFormat("ar-EG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

// ─── Date Formatting ─────────────────────────────────────────

export function formatDate(
  date: Date | string | null | undefined,
  locale = "ar-EG"
): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(
  date: Date | string | null | undefined,
  locale = "ar-EG"
): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return formatDate(date);
  if (days > 0) return `منذ ${days} ${days === 1 ? "يوم" : "أيام"}`;
  if (hours > 0) return `منذ ${hours} ${hours === 1 ? "ساعة" : "ساعات"}`;
  if (minutes > 0) return `منذ ${minutes} ${minutes === 1 ? "دقيقة" : "دقائق"}`;
  return "الآن";
}

// ─── String Helpers ──────────────────────────────────────────

export function truncate(str: string, length = 50): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// ─── Number Helpers ──────────────────────────────────────────

export function toDecimal(value: unknown): number {
  return Number(value ?? 0);
}

export function calcTotal(qty: number, price: number, discount = 0, tax = 0): number {
  const beforeDiscount = qty * price;
  const afterDiscount = beforeDiscount - (beforeDiscount * discount) / 100;
  const withTax = afterDiscount + (afterDiscount * tax) / 100;
  return Math.round(withTax * 100) / 100;
}

export function calcProfit(revenue: number, cost: number): {
  grossProfit: number;
  margin: number;
} {
  const grossProfit = revenue - cost;
  const margin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  return {
    grossProfit: Math.round(grossProfit * 100) / 100,
    margin: Math.round(margin * 10) / 10,
  };
}

// ─── API Response Helpers ────────────────────────────────────

export function successResponse<T>(
  data: T,
  message?: string,
  meta?: Record<string, unknown>
) {
  return {
    success: true,
    message: message ?? "تمت العملية بنجاح",
    data,
    meta,
  };
}

export function errorResponse(
  message: string,
  errors?: Record<string, string[]>,
  status = 400
) {
  return {
    success: false,
    message,
    errors,
    status,
  };
}

// ─── Pagination ──────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export function getPaginationParams(searchParams: URLSearchParams): PaginationParams {
  return {
    page: Math.max(1, Number(searchParams.get("page") ?? 1)),
    limit: Math.min(100, Number(searchParams.get("limit") ?? 20)),
    search: searchParams.get("search") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortDir: (searchParams.get("sortDir") as "asc" | "desc") ?? "desc",
  };
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}

// ─── Status Colors ───────────────────────────────────────────

import { DocumentStatus, JobStatus } from "@prisma/client";

export function getDocumentStatusColor(status: DocumentStatus): string {
  const colors: Record<DocumentStatus, string> = {
    DRAFT:     "bg-gray-100 text-gray-700",
    PENDING:   "bg-yellow-100 text-yellow-800",
    APPROVED:  "bg-green-100 text-green-800",
    REJECTED:  "bg-red-100 text-red-800",
    CANCELLED: "bg-red-50 text-red-600",
    CLOSED:    "bg-blue-100 text-blue-800",
  };
  return colors[status] ?? "bg-gray-100 text-gray-700";
}

export function getDocumentStatusLabel(status: DocumentStatus): string {
  const labels: Record<DocumentStatus, string> = {
    DRAFT:     "مسودة",
    PENDING:   "بانتظار الاعتماد",
    APPROVED:  "معتمد",
    REJECTED:  "مرفوض",
    CANCELLED: "ملغى",
    CLOSED:    "مغلق",
  };
  return labels[status] ?? status;
}

export function getJobStatusLabel(status: JobStatus): string {
  const labels: Record<JobStatus, string> = {
    NEW:           "جديد",
    SURVEYING:     "معاينة",
    QUOTED:        "تم تقديم عرض سعر",
    APPROVED:      "معتمد",
    PURCHASING:    "شراء خامات",
    IN_PRODUCTION: "جارى التصنيع",
    IN_FINISHING:  "جارى التجهيز",
    INSTALLING:    "جارى التركيب",
    DELIVERED:     "تم التسليم",
    INVOICED:      "تم إصدار الفاتورة",
    COLLECTED:     "تم التحصيل",
    CLOSED:        "مغلق",
  };
  return labels[status] ?? status;
}

export function getJobStatusColor(status: JobStatus): string {
  const colors: Record<JobStatus, string> = {
    NEW:           "bg-slate-100 text-slate-700",
    SURVEYING:     "bg-purple-100 text-purple-700",
    QUOTED:        "bg-yellow-100 text-yellow-700",
    APPROVED:      "bg-green-100 text-green-700",
    PURCHASING:    "bg-orange-100 text-orange-700",
    IN_PRODUCTION: "bg-blue-100 text-blue-700",
    IN_FINISHING:  "bg-indigo-100 text-indigo-700",
    INSTALLING:    "bg-cyan-100 text-cyan-700",
    DELIVERED:     "bg-teal-100 text-teal-700",
    INVOICED:      "bg-emerald-100 text-emerald-700",
    COLLECTED:     "bg-green-200 text-green-800",
    CLOSED:        "bg-gray-200 text-gray-700",
  };
  return colors[status] ?? "bg-gray-100 text-gray-700";
}
