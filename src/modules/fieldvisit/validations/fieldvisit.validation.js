import { z } from "zod";

const coerceNumber = (fieldName) =>
  z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number({ invalid_type_error: `${fieldName} must be a number`, required_error: `${fieldName} is required` })
  );

export const locationObjectSchema = z.object({
  latitude: coerceNumber("Latitude"),
  longitude: coerceNumber("Longitude"),
  time: z.union([z.string(), z.number()]).optional(),
});

const locationsSchema = z.preprocess(
  (val) => (val && typeof val === "object" && !Array.isArray(val) ? [val] : val),
  z.array(locationObjectSchema).optional().nullable()
);

export const createFieldVisitSchema = z.object({
  emp_id: z.coerce.number().optional(),
  date: z.preprocess(
    (val) => (val ? new Date(val) : undefined),
    z.date().optional()
  ),
  purpose: z.string().min(1, "Purpose is required").optional(),
  remark: z.string().optional().nullable(),
  locations: locationsSchema,
});

export const updateFieldVisitSchema = z.object({
  emp_id: z.coerce.number().optional(),
  date: z.preprocess(
    (val) => (val ? new Date(val) : undefined),
    z.date().optional()
  ),
  purpose: z.string().min(1, "Purpose is required").optional(),
  remark: z.string().optional().nullable(),
  locations: locationsSchema,
});

export const addLocationSchema = locationObjectSchema;
