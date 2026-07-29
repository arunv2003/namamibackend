import { z } from "zod";

const coerceNumber = (fieldName) =>
  z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number({ invalid_type_error: `${fieldName} must be a number`, required_error: `${fieldName} is required` })
  );

export const createOfficeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(1, "Address is required"),
  state_id: z.coerce.string().min(1, "State ID is required"),
  region_id: z.coerce.string().min(1, "Region ID is required"),
  branch_id: z.coerce.string().min(1, "Branch ID is required"),
  latitude: coerceNumber("Latitude"),
  longitude: coerceNumber("Longitude"),
  radius: coerceNumber("Radius"),
  status: z.enum(["active", "inactive"]).default("active").optional(),
});

export const updateOfficeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  address: z.string().min(1, "Address is required").optional(),
  state_id: z.coerce.string().min(1, "State ID is required").optional(),
  region_id: z.coerce.string().min(1, "Region ID is required").optional(),
  branch_id: z.coerce.string().min(1, "Branch ID is required").optional(),
  latitude: coerceNumber("Latitude").optional().nullable(),
  longitude: coerceNumber("Longitude").optional().nullable(),
  radius: coerceNumber("Radius").optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
});
