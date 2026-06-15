import { z } from "zod";

export const leadSchema = z.object({
  company_name: z.string().min(2, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  contact_person: z.string().min(2, "Contact person is required"),
  position: z.string().optional(),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  city: z.string().optional(),
  source: z.enum(["website", "referral", "linkedin", "cold_email", "exhibition", "whatsapp", "other"]),
  status: z.enum(["new", "contacted", "follow_up", "interested", "quotation_sent", "negotiation", "won", "lost"]),
  estimated_value: z.coerce.number().min(0).optional(),
  follow_up_date: z.string().optional(),
  notes: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof leadSchema>;
