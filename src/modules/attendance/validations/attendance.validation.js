import { z } from "zod";

const locationSchema = z
  .object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    address: z.string().optional(),
  })
  .passthrough()
  .optional()
  .nullable();

export const createAttendanceSchema = z.object({
  employee_id: z.coerce.number().int("Employee ID must be an integer").optional().nullable(),
  location: locationSchema,
  remarks: z.string().optional().nullable(),
  ip_address: z.string().optional().nullable(),
  device_info: z.string().optional().nullable(),
});

export const clockInSchema = z.object({
  employee_id: z.coerce.number().int("Employee ID must be an integer").optional().nullable(),
  location: locationSchema,
  remarks: z.string().optional().nullable(),
  ip_address: z.string().optional().nullable(),
  device_info: z.string().optional().nullable(),
});

export const clockOutSchema = z.object({
  employee_id: z.coerce.number().int("Employee ID must be an integer").optional().nullable(),
  location: locationSchema,
  remarks: z.string().optional().nullable(),
  ip_address: z.string().optional().nullable(),
  device_info: z.string().optional().nullable(),
});

export const updateAttendanceSchema = z.object({
  employee_id: z.coerce.number().int("Employee ID must be an integer").optional().nullable(),
  clock_in: z.coerce.date().optional().nullable(),
  clock_out: z.coerce.date().optional().nullable(),
  status: z.enum(["CLOCKED_IN", "CLOCKED_OUT", "PRESENT", "ABSENT", "HALF_DAY"]).optional(),
  clock_in_location: locationSchema,
  clock_out_location: locationSchema,
  remarks: z.string().optional().nullable(),
  ip_address: z.string().optional().nullable(),
  device_info: z.string().optional().nullable(),
  total_hours: z.number().optional().nullable(),
});