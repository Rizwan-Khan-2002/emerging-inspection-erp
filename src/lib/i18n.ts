// Lightweight bilingual (English / Arabic) dictionary + helpers.
// Language is stored in a `lang` cookie (en | ar); RTL is applied at <html>.

export type Lang = "en" | "ar";

export function normalizeLang(v?: string | null): Lang {
  return v === "ar" ? "ar" : "en";
}

/** Navigation labels by route href. */
const NAV_AR: Record<string, string> = {
  "/dashboard": "لوحة التحكم",
  "/leads": "العملاء المحتملون",
  "/clients": "العملاء",
  "/quotations": "عروض الأسعار",
  "/invoices": "الفواتير",
  "/inspections": "عمليات التفتيش",
  "/reports": "التقارير",
  "/field-ops": "العمليات الميدانية",
  "/projects": "المشاريع",
  "/employees": "الموظفون",
  "/attendance": "الحضور",
  "/overtime": "العمل الإضافي",
  "/payroll": "الرواتب",
  "/vehicles": "المركبات",
  "/fuel": "مصاريف الوقود",
  "/expenses": "مطالبات المصاريف",
  "/documents": "المستندات",
  "/users": "المستخدمون والصلاحيات",
  "/settings": "الإعدادات",
};

const GROUP_AR: Record<string, string> = {
  "Overview": "نظرة عامة",
  "Sales & CRM": "المبيعات وإدارة العملاء",
  "Operations": "العمليات",
  "Workforce": "القوى العاملة",
  "Fleet": "الأسطول",
  "Finance": "المالية",
  "System": "النظام",
};

/** Common UI strings (key = English source string). */
const UI_AR: Record<string, string> = {
  "Search modules — inspections, employees, payroll…": "ابحث في الوحدات — التفتيش، الموظفين، الرواتب…",
  "All systems operational": "جميع الأنظمة تعمل",
  "Demo": "تجريبي",
  "Welcome": "مرحباً",
  "workspace": "مساحة العمل",
};

export function navLabel(lang: Lang, href: string, fallback: string): string {
  return lang === "ar" ? NAV_AR[href] ?? fallback : fallback;
}

export function groupLabel(lang: Lang, group: string): string {
  return lang === "ar" ? GROUP_AR[group] ?? group : group;
}

/** Translate a common UI string; returns the English source if no Arabic exists. */
export function t(lang: Lang, en: string): string {
  return lang === "ar" ? UI_AR[en] ?? en : en;
}
