// ============================================================
// Tashgheel — Database Seed
// Creates: Company, Default Roles, Permissions, Admin User
// Run: npm run db:seed
// ============================================================

import { PrismaClient, AuditAction, DocumentType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 بدء تهيئة قاعدة البيانات...\n");

  // ─── 1. Company ──────────────────────────────────────────

  console.log("📦 إنشاء بيانات الشركة...");
  const company = await prisma.company.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id:       "00000000-0000-0000-0000-000000000001",
      name:     "تشغيل للتصنيع شبه الآلي",
      nameEn:   "Tashgheel Semi Manufacturing",
      currency: "EGP",
      timezone: "Africa/Cairo",
    },
  });
  console.log(`   ✓ الشركة: ${company.name}`);

  // ─── 2. Default Branch ───────────────────────────────────

  console.log("🏢 إنشاء الفرع الرئيسي...");
  const branch = await prisma.branch.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id:        "00000000-0000-0000-0000-000000000002",
      companyId: company.id,
      name:      "المقر الرئيسي",
      isMain:    true,
    },
  });
  console.log(`   ✓ الفرع: ${branch.name}`);

  // ─── 3. Permission Groups & Permissions ──────────────────

  console.log("🔐 إنشاء مجموعات الصلاحيات...");

  const moduleGroups = [
    { module: "customers",  name: "العملاء",         actions: ["view","create","edit","delete","archive","restore","print","export","view_balance","view_statement"] },
    { module: "suppliers",  name: "الموردون",         actions: ["view","create","edit","delete","archive","restore","print","export","view_balance","view_statement"] },
    { module: "items",      name: "الأصناف",          actions: ["view","create","edit","delete","archive","restore","export","view_cost"] },
    { module: "services",   name: "الخدمات",          actions: ["view","create","edit","delete","archive","view_cost"] },
    { module: "cash_accounts", name: "الخزائن",       actions: ["view","create","edit","view_balance"] },
    { module: "quotations", name: "عروض الأسعار",     actions: ["view","create","edit","delete","archive","print","export","approve","reject","cancel","view_cost","view_profit"] },
    { module: "invoices",   name: "الفواتير",         actions: ["view","create","edit","delete","archive","print","export","approve","cancel","view_cost","view_profit"] },
    { module: "receipts",   name: "سندات القبض",      actions: ["view","create","edit","delete","print","export"] },
    { module: "purchases",  name: "المشتريات",        actions: ["view","create","edit","delete","archive","print","export","approve","cancel"] },
    { module: "workshop",   name: "ورشة التشغيل",     actions: ["view","create","edit","delete","archive","print","export","approve","change_status","view_cost","view_profit"] },
    { module: "expenses",   name: "المصروفات",        actions: ["view","create","edit","delete","archive","print","export","approve"] },
    { module: "finance",    name: "التكلفة والربحية", actions: ["view","view_cost","view_profit","export"] },
    { module: "reports",    name: "التقارير",         actions: ["view","print","export","view_cost","view_profit"] },
    { module: "settings",   name: "الإعدادات",        actions: ["view","manage"] },
    { module: "users",      name: "المستخدمون",       actions: ["view","create","edit","delete","manage"] },
    { module: "roles",      name: "الأدوار",          actions: ["view","create","edit","delete","manage"] },
    { module: "audit",      name: "سجل النشاط",       actions: ["view","export"] },
  ];

  const actionLabels: Record<string, string> = {
    view: "مشاهدة", create: "إضافة", edit: "تعديل", delete: "حذف",
    archive: "أرشفة", restore: "استعادة", print: "طباعة", export: "تصدير",
    approve: "اعتماد", reject: "رفض", cancel: "إلغاء",
    change_status: "تغيير الحالة", view_cost: "رؤية التكلفة",
    view_profit: "رؤية الربح", view_balance: "رؤية الرصيد",
    view_statement: "كشف الحساب", manage: "إدارة",
  };

  const allPermissions: { id: string; module: string; action: string }[] = [];

  for (const group of moduleGroups) {
    const pg = await prisma.permissionGroup.upsert({
      where: { id: `pg-${group.module}` },
      update: { name: group.name },
      create: {
        id:     `pg-${group.module}`,
        name:   group.name,
        module: group.module,
      },
    });

    for (const action of group.actions) {
      const permId = `perm-${group.module}-${action}`;
      const perm = await prisma.permission.upsert({
        where: { module_action: { module: group.module, action } },
        update: {},
        create: {
          id:      permId,
          groupId: pg.id,
          module:  group.module,
          action,
          label:   `${actionLabels[action] ?? action} — ${group.name}`,
        },
      });
      allPermissions.push({ id: perm.id, module: perm.module, action: perm.action });
    }
  }
  console.log(`   ✓ ${allPermissions.length} صلاحية مُنشأة`);

  // ─── 4. Roles ────────────────────────────────────────────

  console.log("👑 إنشاء الأدوار الافتراضية...");

  // Admin Role (all permissions)
  const adminRole = await prisma.role.upsert({
    where: { id: "role-admin" },
    update: {},
    create: {
      id:          "role-admin",
      companyId:   company.id,
      name:        "مدير النظام",
      description: "صلاحيات كاملة على جميع وظائف النظام",
      isSystem:    true,
    },
  });

  // Assign all permissions to admin
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }
  console.log(`   ✓ دور: ${adminRole.name} (${allPermissions.length} صلاحية)`);

  // Accountant Role
  const accountantPermissions = allPermissions.filter((p) =>
    ["customers","suppliers","invoices","receipts","purchases","expenses","reports","cash_accounts"].includes(p.module) &&
    !["delete", "manage"].includes(p.action)
  );

  const accountantRole = await prisma.role.upsert({
    where: { id: "role-accountant" },
    update: {},
    create: {
      id:          "role-accountant",
      companyId:   company.id,
      name:        "محاسب",
      description: "إدارة الفواتير والمتحصلات والتقارير المالية",
      isSystem:    true,
    },
  });

  for (const perm of accountantPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: accountantRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: accountantRole.id, permissionId: perm.id },
    });
  }
  console.log(`   ✓ دور: ${accountantRole.name} (${accountantPermissions.length} صلاحية)`);

  // Workshop Supervisor Role
  const workshopPermissions = allPermissions.filter((p) =>
    ["customers","workshop","items","services"].includes(p.module) &&
    ["view","create","edit","change_status","print"].includes(p.action)
  );

  const workshopRole = await prisma.role.upsert({
    where: { id: "role-workshop" },
    update: {},
    create: {
      id:          "role-workshop",
      companyId:   company.id,
      name:        "مشرف الورشة",
      description: "إدارة أوامر التشغيل ومتابعة التنفيذ",
      isSystem:    true,
    },
  });

  for (const perm of workshopPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: workshopRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: workshopRole.id, permissionId: perm.id },
    });
  }
  console.log(`   ✓ دور: ${workshopRole.name} (${workshopPermissions.length} صلاحية)`);

  // ─── 5. Document Numbering ───────────────────────────────

  console.log("🔢 إعداد تسلسل أرقام المستندات...");
  const docTypes = [
    { docType: DocumentType.QUOTATION,          prefix: "QUO" },
    { docType: DocumentType.CUSTOMER_INVOICE,   prefix: "INV" },
    { docType: DocumentType.CUSTOMER_RECEIPT,   prefix: "REC" },
    { docType: DocumentType.PURCHASE_ORDER,     prefix: "PO"  },
    { docType: DocumentType.PURCHASE_INVOICE,   prefix: "PI"  },
    { docType: DocumentType.SUPPLIER_PAYMENT,   prefix: "SP"  },
    { docType: DocumentType.EXPENSE_VOUCHER,    prefix: "EXP" },
    { docType: DocumentType.JOB_ORDER,          prefix: "JO"  },
  ];

  for (const dt of docTypes) {
    await prisma.documentNumbering.upsert({
      where: { docType: dt.docType },
      update: {},
      create: {
        companyId:   company.id,
        docType:     dt.docType,
        prefix:      dt.prefix,
        separator:   "-",
        includeYear: true,
        yearFormat:  "YYYY",
        padding:     6,
        currentSeq:  0,
        resetYearly: true,
      },
    });
  }
  console.log(`   ✓ ${docTypes.length} أنواع مستندات`);

  // ─── 6. Lookup Data ──────────────────────────────────────

  console.log("📋 إضافة البيانات المرجعية...");

  // Currencies
  await prisma.currency.upsert({
    where: { code: "EGP" },
    update: {},
    create: { name: "الجنيه المصري", nameEn: "Egyptian Pound", code: "EGP", symbol: "ج.م", decimals: 2 },
  });
  await prisma.currency.upsert({
    where: { code: "USD" },
    update: {},
    create: { name: "الدولار الأمريكي", nameEn: "US Dollar", code: "USD", symbol: "$", decimals: 2 },
  });

  // Country
  const egypt = await prisma.country.upsert({
    where: { code: "EG" },
    update: {},
    create: { name: "مصر", nameEn: "Egypt", code: "EG", dialCode: "+20" },
  });

  // Cities
  const cities = ["القاهرة","الجيزة","الإسكندرية","أسيوط","سوهاج","قنا","الأقصر","أسوان","الفيوم","بني سويف","المنيا","الشرقية","الدقهلية","الغربية","المنوفية","القليوبية","كفر الشيخ","البحيرة","الإسماعيلية","السويس","بورسعيد","دمياط","الوادي الجديد","مطروح","شمال سيناء","جنوب سيناء"];
  for (const city of cities) {
    await prisma.city.upsert({
      where: { id: `city-${city}` },
      update: {},
      create: { id: `city-${city}`, countryId: egypt.id, name: city },
    });
  }
  console.log(`   ✓ ${cities.length} محافظة`);

  // ─── 7. Admin User ───────────────────────────────────────

  console.log("👤 إنشاء حساب المدير...");
  const adminPassword = await bcrypt.hash("Admin@123456", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@tashgheel.com" },
    update: {},
    create: {
      companyId:    company.id,
      branchId:     branch.id,
      roleId:       adminRole.id,
      name:         "مدير النظام",
      email:        "admin@tashgheel.com",
      passwordHash: adminPassword,
      isOwner:      true,
      status:       "ACTIVE",
    },
  });
  console.log(`   ✓ المستخدم: ${adminUser.email}`);

  // ─── Done ────────────────────────────────────────────────

  console.log("\n✅ تم تهيئة قاعدة البيانات بنجاح!\n");
  console.log("بيانات تسجيل الدخول الافتراضية:");
  console.log("─────────────────────────────────");
  console.log(`📧 البريد: admin@tashgheel.com`);
  console.log(`🔑 كلمة المرور: Admin@123456`);
  console.log("─────────────────────────────────");
  console.log("⚠️  يرجى تغيير كلمة المرور فور تسجيل الدخول الأول\n");
}

main()
  .catch((e) => {
    console.error("❌ خطأ في التهيئة:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
