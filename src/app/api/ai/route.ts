import { NextResponse } from "next/server";

/**
 * Claude API endpoint for AI features (cold emails, follow-ups, report
 * summaries, quotation drafting, WhatsApp messages).
 *
 * Falls back to a clear error when ANTHROPIC_API_KEY is not set, so the UI
 * can use the offline templates in /src/lib/ai-templates.ts during demo.
 *
 * POST body: { task: string, context: object }
 */
export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured — using offline templates." },
      { status: 503 }
    );
  }

  const { task, context } = await req.json();

  const prompt = buildPrompt(task, context);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: `Claude API error ${res.status}` }, { status: 502 });
  }

  const data = await res.json();
  const text = data?.content?.[0]?.text ?? "";
  return NextResponse.json({ text });
}

function buildPrompt(task: string, context: unknown) {
  const ctx = JSON.stringify(context ?? {}, null, 2);
  const map: Record<string, string> = {
    cold_email: "Write a concise, professional B2B cold email from an industrial inspection company to this lead. Saudi/GCC context. Return subject and body.",
    follow_up: "Write a brief, polite follow-up email to this lead about inspection services.",
    report_summary: "Summarise this inspection report into a clear executive summary for the client.",
    quotation: "Draft professional quotation wording (scope, terms) for this inspection service request.",
    whatsapp: "Write a short, friendly WhatsApp outreach message (1-2 sentences) for this lead.",
  };
  const instruction = map[task] ?? "Assist with the following industrial-inspection ERP task.";
  return `${instruction}\n\nContext:\n${ctx}`;
}
