// ============================================================
// Tashgheel — Permission Matrix System
// ============================================================

// ─── Modules ────────────────────────────────────────────────

export const MODULES = {
  CUSTOMERS:   "customers",
  SUPPLIERS:   "suppliers",
  ITEMS:       "items",
  SERVICES:    "services",
  CASH:        "cash_accounts",
  QUOTATIONS:  "quotations",
  INVOICES:    "invoices",
  RECEIPTS:    "receipts",
  PURCHASES:   "purchases",
  WORKSHOP:    "workshop",
  EXPENSES:    "expenses",
  FINANCE:     "finance",
  REPORTS:     "reports",
  SETTINGS:    "settings",
  USERS:       "users",
  ROLES:       "roles",
  AUDIT:       "audit",
} as const;

export type Module = (typeof MODULES)[keyof typeof MODULES];

// ─── Actions ─────────────────────────────────────────────────

export const ACTIONS = {
  VIEW:            "view",
  CREATE:          "create",
  EDIT:            "edit",
  DELETE:          "delete",
  ARCHIVE:         "archive",
  RESTORE:         "restore",
  PRINT:           "print",
  EXPORT:          "export",
  APPROVE:         "approve",
  REJECT:          "reject",
  CANCEL:          "cancel",
  CHANGE_STATUS:   "change_status",
  VIEW_COST:       "view_cost",
  VIEW_PROFIT:     "view_profit",
  VIEW_BALANCE:    "view_balance",
  VIEW_STATEMENT:  "view_statement",
  MANAGE:          "manage",  // for settings/users/roles
} as const;

export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];

// ─── Permission Key ──────────────────────────────────────────

export type PermissionKey = `${Module}:${Action}`;

export function permKey(module: Module, action: Action): PermissionKey {
  return `${module}:${action}`;
}

// ─── Default Permission Matrix ───────────────────────────────

export const DEFAULT_PERMISSIONS: Record<Module, Action[]> = {
  [MODULES.CUSTOMERS]:  [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.ARCHIVE, ACTIONS.RESTORE, ACTIONS.PRINT, ACTIONS.EXPORT, ACTIONS.VIEW_BALANCE, ACTIONS.VIEW_STATEMENT],
  [MODULES.SUPPLIERS]:  [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.ARCHIVE, ACTIONS.RESTORE, ACTIONS.PRINT, ACTIONS.EXPORT, ACTIONS.VIEW_BALANCE, ACTIONS.VIEW_STATEMENT],
  [MODULES.ITEMS]:      [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.ARCHIVE, ACTIONS.RESTORE, ACTIONS.EXPORT, ACTIONS.VIEW_COST],
  [MODULES.SERVICES]:   [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.ARCHIVE, ACTIONS.VIEW_COST],
  [MODULES.CASH]:       [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.VIEW_BALANCE],
  [MODULES.QUOTATIONS]: [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.ARCHIVE, ACTIONS.PRINT, ACTIONS.EXPORT, ACTIONS.APPROVE, ACTIONS.REJECT, ACTIONS.CANCEL, ACTIONS.VIEW_COST, ACTIONS.VIEW_PROFIT],
  [MODULES.INVOICES]:   [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.ARCHIVE, ACTIONS.PRINT, ACTIONS.EXPORT, ACTIONS.APPROVE, ACTIONS.CANCEL, ACTIONS.VIEW_COST, ACTIONS.VIEW_PROFIT],
  [MODULES.RECEIPTS]:   [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.PRINT, ACTIONS.EXPORT],
  [MODULES.PURCHASES]:  [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.ARCHIVE, ACTIONS.PRINT, ACTIONS.EXPORT, ACTIONS.APPROVE, ACTIONS.CANCEL],
  [MODULES.WORKSHOP]:   [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.ARCHIVE, ACTIONS.PRINT, ACTIONS.EXPORT, ACTIONS.APPROVE, ACTIONS.CHANGE_STATUS, ACTIONS.VIEW_COST, ACTIONS.VIEW_PROFIT],
  [MODULES.EXPENSES]:   [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.ARCHIVE, ACTIONS.PRINT, ACTIONS.EXPORT, ACTIONS.APPROVE],
  [MODULES.FINANCE]:    [ACTIONS.VIEW, ACTIONS.VIEW_COST, ACTIONS.VIEW_PROFIT, ACTIONS.EXPORT],
  [MODULES.REPORTS]:    [ACTIONS.VIEW, ACTIONS.PRINT, ACTIONS.EXPORT, ACTIONS.VIEW_COST, ACTIONS.VIEW_PROFIT],
  [MODULES.SETTINGS]:   [ACTIONS.VIEW, ACTIONS.MANAGE],
  [MODULES.USERS]:      [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.MANAGE],
  [MODULES.ROLES]:      [ACTIONS.VIEW, ACTIONS.CREATE, ACTIONS.EDIT, ACTIONS.DELETE, ACTIONS.MANAGE],
  [MODULES.AUDIT]:      [ACTIONS.VIEW, ACTIONS.EXPORT],
};

// ─── Permission Checker ──────────────────────────────────────

export type UserPermissions = Set<PermissionKey>;

export function buildPermissionSet(
  rolePermissions: Array<{ module: string; action: string }>
): UserPermissions {
  const set = new Set<PermissionKey>();
  for (const p of rolePermissions) {
    set.add(`${p.module}:${p.action}` as PermissionKey);
  }
  return set;
}

export function can(
  permissions: UserPermissions,
  module: Module,
  action: Action
): boolean {
  return permissions.has(permKey(module, action));
}

export function canAny(
  permissions: UserPermissions,
  module: Module,
  actions: Action[]
): boolean {
  return actions.some((a) => can(permissions, module, a));
}

export function canAll(
  permissions: UserPermissions,
  module: Module,
  actions: Action[]
): boolean {
  return actions.every((a) => can(permissions, module, a));
}

// ─── Module Labels (Arabic) ──────────────────────────────────

export const MODULE_LABELS: Record<Module, string> = {
  [MODULES.CUSTOMERS]:  "العملاء",
  [MODULES.SUPPLIERS]:  "الموردون",
  [MODULES.ITEMS]:      "الأصناف",
  [MODULES.SERVICES]:   "الخدمات",
  [MODULES.CASH]:       "الخزائن",
  [MODULES.QUOTATIONS]: "عروض الأسعار",
  [MODULES.INVOICES]:   "الفواتير",
  [MODULES.RECEIPTS]:   "سندات القبض",
  [MODULES.PURCHASES]:  "المشتريات",
  [MODULES.WORKSHOP]:   "ورشة التشغيل",
  [MODULES.EXPENSES]:   "المصروفات",
  [MODULES.FINANCE]:    "التكلفة والربحية",
  [MODULES.REPORTS]:    "التقارير",
  [MODULES.SETTINGS]:   "الإعدادات",
  [MODULES.USERS]:      "المستخدمون",
  [MODULES.ROLES]:      "الأدوار",
  [MODULES.AUDIT]:      "سجل النشاط",
};

export const ACTION_LABELS: Record<Action, string> = {
  [ACTIONS.VIEW]:           "مشاهدة",
  [ACTIONS.CREATE]:         "إضافة",
  [ACTIONS.EDIT]:           "تعديل",
  [ACTIONS.DELETE]:         "حذف",
  [ACTIONS.ARCHIVE]:        "أرشفة",
  [ACTIONS.RESTORE]:        "استعادة",
  [ACTIONS.PRINT]:          "طباعة",
  [ACTIONS.EXPORT]:         "تصدير",
  [ACTIONS.APPROVE]:        "اعتماد",
  [ACTIONS.REJECT]:         "رفض",
  [ACTIONS.CANCEL]:         "إلغاء",
  [ACTIONS.CHANGE_STATUS]:  "تغيير الحالة",
  [ACTIONS.VIEW_COST]:      "رؤية التكلفة",
  [ACTIONS.VIEW_PROFIT]:    "رؤية الربح",
  [ACTIONS.VIEW_BALANCE]:   "رؤية الرصيد",
  [ACTIONS.VIEW_STATEMENT]: "كشف الحساب",
  [ACTIONS.MANAGE]:         "إدارة",
};
