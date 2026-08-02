// ============================================================
// Tashgheel — Document Numbering Engine
// INV-2026-000001 | QUO-2026-000001 | PO-2026-000001
// ============================================================

import prisma from "./db";
import { DocumentType } from "@prisma/client";

export { DocumentType };

// ─── Generate Next Number ────────────────────────────────────

export async function generateDocumentNumber(
  companyId: string,
  docType: DocumentType,
  branchId?: string
): Promise<string> {
  // Atomic increment using database transaction
  const result = await prisma.$transaction(async (tx) => {
    // Get or create numbering config
    let config = await tx.documentNumbering.findFirst({
      where: { companyId, docType },
    });

    if (!config) {
      // Create default config
      config = await tx.documentNumbering.create({
        data: {
          companyId,
          docType,
          prefix: getDefaultPrefix(docType),
          separator: "-",
          includeYear: true,
          yearFormat: "YYYY",
          padding: 6,
          currentSeq: 0,
          resetYearly: true,
        },
      });
    }

    const currentYear = new Date().getFullYear();

    // Reset sequence if new year and resetYearly is true
    let seq = config.currentSeq;
    if (config.resetYearly && config.lastYear && config.lastYear !== currentYear) {
      seq = 0;
    }

    seq += 1;

    // Update sequence
    await tx.documentNumbering.update({
      where: { id: config.id },
      data: {
        currentSeq: seq,
        lastYear: currentYear,
      },
    });

    return { config, seq, currentYear };
  });

  const { config, seq, currentYear } = result;

  // Build number: PREFIX-YEAR-SEQUENCE
  const parts: string[] = [config.prefix];

  if (config.includeYear) {
    const yearStr =
      config.yearFormat === "YY"
        ? String(currentYear).slice(-2)
        : String(currentYear);
    parts.push(yearStr);
  }

  parts.push(String(seq).padStart(config.padding, "0"));

  return parts.join(config.separator);
}

// ─── Default Prefixes ────────────────────────────────────────

function getDefaultPrefix(docType: DocumentType): string {
  const prefixes: Record<DocumentType, string> = {
    [DocumentType.QUOTATION]:          "QUO",
    [DocumentType.CUSTOMER_INVOICE]:   "INV",
    [DocumentType.CUSTOMER_RECEIPT]:   "REC",
    [DocumentType.PURCHASE_ORDER]:     "PO",
    [DocumentType.PURCHASE_INVOICE]:   "PI",
    [DocumentType.SUPPLIER_PAYMENT]:   "SP",
    [DocumentType.EXPENSE_VOUCHER]:    "EXP",
    [DocumentType.JOB_ORDER]:          "JO",
  };
  return prefixes[docType] ?? "DOC";
}

// ─── Preview Number (without saving) ─────────────────────────

export async function previewDocumentNumber(
  companyId: string,
  docType: DocumentType
): Promise<string> {
  const config = await prisma.documentNumbering.findFirst({
    where: { companyId, docType },
  });

  const prefix = config?.prefix ?? getDefaultPrefix(docType);
  const sep = config?.separator ?? "-";
  const padding = config?.padding ?? 6;
  const includeYear = config?.includeYear ?? true;
  const yearFormat = config?.yearFormat ?? "YYYY";
  const currentYear = new Date().getFullYear();
  const nextSeq = (config?.currentSeq ?? 0) + 1;

  const parts: string[] = [prefix];
  if (includeYear) {
    parts.push(yearFormat === "YY" ? String(currentYear).slice(-2) : String(currentYear));
  }
  parts.push(String(nextSeq).padStart(padding, "0"));

  return parts.join(sep);
}
