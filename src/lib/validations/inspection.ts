import { z } from "zod";

export const inspectionSchema = z.object({
  type: z.enum(["scaffolding", "ndt", "qaqc", "mechanical", "electrical", "safety", "civil", "lifting"]),
  client_id: z.string().min(1, "Client is required"),
  site_location: z.string().min(2, "Site location is required"),
  scheduled_at: z.string().min(1, "Date & time is required"),
  priority: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["pending", "assigned", "in_progress", "submitted", "under_review", "approved", "sent_to_client", "closed"]),
  remarks: z.string().optional(),
});

export type InspectionFormValues = z.infer<typeof inspectionSchema>;
