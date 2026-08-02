// ============================================================
// Tashgheel — Activity Log (Full Audit System)
// ============================================================

import prisma from "./db";
import { AuditAction } from "@prisma/client";
import { TokenPayload } from "./auth";

export { AuditAction };

interface LogActivityParams {
  session: TokenPayload | null;
  action: AuditAction;
  module: string;
  entityId?: string;
  entityName?: string;
  entityType?: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
}

// ─── Compute Diff ────────────────────────────────────────────

function computeChanges(
  oldData?: Record<string, unknown>,
  newData?: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> | undefined {
  if (!oldData || !newData) return undefined;

  const changes: Record<string, { from: unknown; to: unknown }> = {};
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

  for (const key of allKeys) {
    if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
      changes[key] = { from: oldData[key], to: newData[key] };
    }
  }

  return Object.keys(changes).length > 0 ? changes : undefined;
}

// ─── Log Activity ────────────────────────────────────────────

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    const changes = computeChanges(params.oldData, params.newData);

    await prisma.activityLog.create({
      data: {
        companyId:  params.session?.companyId ?? "system",
        branchId:   params.session?.branchId,
        userId:     params.session?.userId,
        userName:   params.session ? params.session.name : "النظام",
        userRole:   params.session?.roleId,
        action:     params.action,
        module:     params.module,
        entityId:   params.entityId,
        entityName: params.entityName,
        entityType: params.entityType,
        oldData:    params.oldData ? (params.oldData as object) : undefined,
        newData:    params.newData ? (params.newData as object) : undefined,
        changes:    changes ? (changes as object) : undefined,
        ipAddress:  params.ipAddress,
        userAgent:  params.userAgent,
        notes:      params.notes,
      },
    });
  } catch (error) {
    // Log to console but don't break the main flow
    console.error("[ActivityLog] Failed to log activity:", error);
  }
}

// ─── Shorthand Helpers ───────────────────────────────────────

export const audit = {
  create: (
    session: TokenPayload,
    module: string,
    entityId: string,
    entityName: string,
    newData?: Record<string, unknown>
  ) =>
    logActivity({
      session,
      action: AuditAction.CREATE,
      module,
      entityId,
      entityName,
      entityType: module,
      newData,
    }),

  update: (
    session: TokenPayload,
    module: string,
    entityId: string,
    entityName: string,
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>
  ) =>
    logActivity({
      session,
      action: AuditAction.UPDATE,
      module,
      entityId,
      entityName,
      entityType: module,
      oldData,
      newData,
    }),

  delete: (
    session: TokenPayload,
    module: string,
    entityId: string,
    entityName: string
  ) =>
    logActivity({
      session,
      action: AuditAction.DELETE,
      module,
      entityId,
      entityName,
      entityType: module,
    }),

  print: (
    session: TokenPayload,
    module: string,
    entityId: string,
    entityName: string
  ) =>
    logActivity({
      session,
      action: AuditAction.PRINT,
      module,
      entityId,
      entityName,
      entityType: module,
    }),

  exportPDF: (
    session: TokenPayload,
    module: string,
    entityId: string,
    entityName: string
  ) =>
    logActivity({
      session,
      action: AuditAction.EXPORT_PDF,
      module,
      entityId,
      entityName,
    }),

  exportExcel: (
    session: TokenPayload,
    module: string,
    entityName: string
  ) =>
    logActivity({
      session,
      action: AuditAction.EXPORT_EXCEL,
      module,
      entityName,
    }),

  login: (
    session: TokenPayload,
    ipAddress?: string,
    userAgent?: string
  ) =>
    logActivity({
      session,
      action: AuditAction.LOGIN,
      module: "auth",
      entityName: session.email,
      ipAddress,
      userAgent,
    }),

  logout: (session: TokenPayload, ipAddress?: string) =>
    logActivity({
      session,
      action: AuditAction.LOGOUT,
      module: "auth",
      entityName: session.email,
      ipAddress,
    }),

  failedLogin: (
    email: string,
    ipAddress?: string,
    userAgent?: string
  ) =>
    logActivity({
      session: null,
      action: AuditAction.FAILED_LOGIN,
      module: "auth",
      entityName: email,
      ipAddress,
      userAgent,
    }),

  statusChange: (
    session: TokenPayload,
    module: string,
    entityId: string,
    entityName: string,
    oldStatus: string,
    newStatus: string
  ) =>
    logActivity({
      session,
      action: AuditAction.STATUS_CHANGE,
      module,
      entityId,
      entityName,
      oldData: { status: oldStatus },
      newData: { status: newStatus },
    }),
};
