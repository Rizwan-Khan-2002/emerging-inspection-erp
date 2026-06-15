import type { Lead } from "./types";

/**
 * Demo AI generators. These produce solid templated output offline so the UI
 * works without keys. In production, replace the bodies with a call to the
 * Claude API (see /src/app/api/ai/route.ts) — the signatures stay the same.
 */

export function coldEmail(lead: Lead): { subject: string; body: string } {
  const first = lead.contact_person.split(" ")[0];
  return {
    subject: `Inspection & QA/QC support for ${lead.company_name}`,
    body: `Dear ${first},

I hope this message finds you well. I'm reaching out from Emerging Inspection — a Saudi-based industrial inspection and technical manpower company supporting ${lead.industry.toLowerCase()} operations across the Kingdom and the wider GCC.

We specialise in scaffolding inspection, NDT, QA/QC, mechanical, electrical and lifting-equipment inspection, as well as shutdown and plant-maintenance manpower. Our certified inspectors help clients like ${lead.company_name} stay compliant, reduce downtime, and pass audits with confidence.

I'd welcome a short call to understand your upcoming inspection and shutdown requirements${lead.city ? ` in ${lead.city}` : ""}, and to share how we can add value.

Would you be open to a 15-minute conversation this week?

Best regards,
Emerging Inspection
Operations Team`,
  };
}

export function followUpEmail(lead: Lead): { subject: string; body: string } {
  const first = lead.contact_person.split(" ")[0];
  return {
    subject: `Following up — inspection support for ${lead.company_name}`,
    body: `Dear ${first},

I wanted to follow up on my previous note regarding inspection and QA/QC support for ${lead.company_name}.

We currently have certified inspectors available and can mobilise quickly for both planned inspections and shutdown scopes. If timing is a factor for any upcoming work, I'd be glad to prepare a tailored proposal.

Is there a good time this week for a brief call?

Best regards,
Emerging Inspection
Operations Team`,
  };
}

export function whatsappMessage(lead: Lead): string {
  const first = lead.contact_person.split(" ")[0];
  return `Hello ${first}, this is Emerging Inspection (Saudi-based industrial inspection & QA/QC). We'd love to support ${lead.company_name} with scaffolding, NDT, QA/QC and shutdown inspection services. May we share a short profile and discuss your upcoming requirements?`;
}
