import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";

const settingsSchema = z.object({
  name: z.string().min(1, "اسم الشركة مطلوب"),
  logo: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  taxNumber: z.string().optional(),
  commercialReg: z.string().optional(),
  themeColor: z.string().default("#0284c7"),
  printNotes: z.string().optional(),
});

export async function GET() {
  try {
    const company = await prisma.company.findFirst({
      include: {
        settings: true,
      },
    });

    if (!company) {
      return NextResponse.json({ success: false, message: "الشركة غير موجودة" }, { status: 404 });
    }

    const themeSetting = company.settings.find((s) => s.key === "themeColor");
    const notesSetting = company.settings.find((s) => s.key === "printNotes");

    return NextResponse.json({
      success: true,
      data: {
        id: company.id,
        name: company.name,
        logo: company.logo,
        phone: company.phone,
        email: company.email,
        address: company.address,
        taxNumber: company.taxNumber,
        commercialReg: company.commercialReg,
        themeColor: themeSetting?.value || "#0284c7",
        printNotes: notesSetting?.value || "",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "فشل جلب الإعدادات" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "بيانات غير صحيحة" }, { status: 400 });
    }

    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json({ success: false, message: "لم يتم العثور على الشركة" }, { status: 404 });
    }

    // Update Company Record
    const updatedCompany = await prisma.company.update({
      where: { id: company.id },
      data: {
        name: parsed.data.name,
        logo: parsed.data.logo,
        phone: parsed.data.phone,
        email: parsed.data.email,
        address: parsed.data.address,
        taxNumber: parsed.data.taxNumber,
        commercialReg: parsed.data.commercialReg,
      },
    });

    // Update Theme Setting
    await prisma.systemSetting.upsert({
      where: {
        companyId_key: {
          companyId: company.id,
          key: "themeColor",
        },
      },
      update: { value: parsed.data.themeColor },
      create: {
        companyId: company.id,
        key: "themeColor",
        value: parsed.data.themeColor,
      },
    });

    // Update Print Notes Setting
    await prisma.systemSetting.upsert({
      where: {
        companyId_key: {
          companyId: company.id,
          key: "printNotes",
        },
      },
      update: { value: parsed.data.printNotes },
      create: {
        companyId: company.id,
        key: "printNotes",
        value: parsed.data.printNotes,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم حفظ الإعدادات بنجاح",
      data: {
        ...updatedCompany,
        themeColor: parsed.data.themeColor,
        printNotes: parsed.data.printNotes,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || "فشل حفظ الإعدادات" }, { status: 500 });
  }
}
