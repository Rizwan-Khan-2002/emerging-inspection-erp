import "server-only";
import { Resend } from "resend";

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || "Emerging Inspection <onboarding@resend.dev>";

/** True when a Resend API key is configured. */
export const emailEnabled = !!KEY;

export async function sendEmail({
  to, subject, html,
}: { to: string; subject: string; html: string }): Promise<{ ok: boolean; error?: string }> {
  if (!KEY) return { ok: false, error: "Email not configured (RESEND_API_KEY missing)." };
  try {
    const resend = new Resend(KEY);
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) return { ok: false, error: (error as { message?: string }).message ?? String(error) };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Email send failed" };
  }
}

/** Branded dark-navy + orange HTML email shell. */
export function emailLayout(title: string, bodyHtml: string): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;background:#071827;padding:24px">
    <div style="max-width:560px;margin:0 auto;background:#102437;border:1px solid #1c3650;border-radius:12px;overflow:hidden">
      <div style="background:#071827;padding:20px 24px;border-bottom:1px solid #1c3650">
        <span style="color:#ff7a00;font-weight:bold;font-size:18px">EMERGING INSPECTION</span>
        <span style="color:#6b7c8d;font-size:11px;letter-spacing:2px;display:block;margin-top:2px">INSPECTION ERP</span>
      </div>
      <div style="padding:24px;color:#e6edf3;font-size:14px;line-height:1.6">
        <h2 style="margin:0 0 14px;color:#ffffff;font-size:18px">${title}</h2>
        ${bodyHtml}
      </div>
      <div style="padding:16px 24px;border-top:1px solid #1c3650;color:#6b7c8d;font-size:11px">
        Emerging Inspection ERP · Industrial Inspection Services · Saudi Arabia
      </div>
    </div>
  </div>`;
}

export function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#ff7a00;color:#071827;font-weight:bold;text-decoration:none;padding:11px 22px;border-radius:8px;font-size:14px">${label}</a>`;
}
