import type { Metadata } from "next";
import { Geist, Cairo } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { normalizeLang } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "Emerging Inspection ERP",
  description:
    "Industrial Inspection ERP, CRM, Payroll & Field Operations platform for Saudi Arabia / GCC inspection companies.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const lang = normalizeLang((await cookies()).get("lang")?.value);
  const dir = lang === "ar" ? "rtl" : "ltr";
  return (
    <html
      lang={lang}
      dir={dir}
      className={`${geistSans.variable} ${cairo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
