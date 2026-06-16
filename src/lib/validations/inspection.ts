import { z } from "zod";

export const inspectionSchema = z.object({
  type: z.enum(["scaffolding", "ndt", "qaqc", "mechanical", "electrical", "safety", "civil", "lifting"]),
  client_id: z.string().min(1, "Client is required"),
  site_location: z.string().min(2, "Site location is required"),
  scheduled_at: z.string().min(1, "Date & time is required"),
  priority: z.enum(["low", "medium", "high", "critical"]),
  status: z.enum(["pending", "assigned", "in_progress", "submitted", "under_review", "approved", "sent_to_client", "closed"]),
  approval_type: z.enum(["aramco", "non_aramco"]).optional(),
  qm_type: z.string().optional(),
  material: z.string().optional(),
  lat: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().min(-90).max(90).optional()),
  lng: z.preprocess((v) => (v === "" || v == null ? undefined : v), z.coerce.number().min(-180).max(180).optional()),
  remarks: z.string().optional(),
});

export type InspectionFormValues = z.infer<typeof inspectionSchema>;

/** QM approval categories (mechanical inspection). */
export const QM_TYPES = ["QM-3", "QM-4", "QM-5", "QM-6", "QM-7", "QM-8", "QM-9"] as const;

/** Material / component categories. */
export const MATERIAL_TYPES = [
  "Structure", "Fastener", "Valve", "Piping", "Flange", "Bolting", "Plate", "Pipe Fitting", "Gasket", "Other",
] as const;
