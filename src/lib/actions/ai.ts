"use server";

import { geminiGenerate } from "@/lib/ai/gemini";
import { coldEmail, followUpEmail } from "@/lib/ai-templates";
import type { Lead } from "@/lib/types";

export type GeneratedEmail = { subject: string; body: string; ai: boolean };

/** Generate a sales email for a lead using Gemini, falling back to a template. */
export async function generateLeadEmail(
  lead: Lead, mode: "cold" | "follow"
): Promise<GeneratedEmail> {
  const kind = mode === "cold" ? "first-touch cold outreach" : "polite follow-up";
  const prompt = `You are a senior business development representative at "Emerging Inspection", an industrial inspection company in Saudi Arabia offering scaffolding inspection, NDT, QA/QC, mechanical and lifting-equipment inspection, and Aramco/non-Aramco approvals.

Write a ${kind} email to:
- Contact: ${lead.contact_person}${lead.position ? `, ${lead.position}` : ""}
- Company: ${lead.company_name}${lead.industry ? ` (${lead.industry})` : ""}${lead.city ? `, ${lead.city}` : ""}
${lead.notes ? `- Context: ${lead.notes}` : ""}

Rules: professional and warm, max ~140 words, no markdown, one clear call to action (a short intro call). Sign off as "Emerging Inspection Team".
Return EXACTLY in this format and nothing else:
Subject: <one line>

<email body>`;

  const out = await geminiGenerate(prompt);
  if (out) {
    const m = out.match(/^\s*subject:\s*(.+?)\r?\n\r?\n([\s\S]+)$/i);
    if (m) return { subject: m[1].trim(), body: m[2].trim(), ai: true };
    // Model didn't follow the format — still use its text as the body.
    return { subject: `Inspection services for ${lead.company_name}`, body: out, ai: true };
  }

  const tpl = mode === "cold" ? coldEmail(lead) : followUpEmail(lead);
  return { subject: tpl.subject, body: tpl.body, ai: false };
}
