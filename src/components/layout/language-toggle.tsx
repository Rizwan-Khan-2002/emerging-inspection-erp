"use client";

import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import type { Lang } from "@/lib/i18n";

export function LanguageToggle({ lang }: { lang: Lang }) {
  const router = useRouter();

  function toggle() {
    const next: Lang = lang === "ar" ? "en" : "ar";
    document.cookie = `lang=${next};path=/;max-age=31536000;samesite=lax`;
    // Apply direction instantly, then refresh server components to re-render translated.
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      title={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
      className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-navy-700 px-2.5 text-sm font-medium text-steel transition-colors hover:border-accent/40 hover:text-foreground"
    >
      <Languages className="size-4" />
      {lang === "ar" ? "EN" : "ع"}
    </button>
  );
}
