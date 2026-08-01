import { z } from "zod";

export const applyLeaveSchema = z.object({
  emp_id: z.number().int().optional(),
  leave_type_id: z.number({ required_error: "Leave type is required" }).int("Leave type ID must be an integer"),
  dayType: z.enum(["full_day", "half_day"]).optional().default("full_day"),
  from_date: z.string({ required_error: "From date is required" }),
  to_date: z.string({ required_error: "To date is required" }),
  duration: z.number().positive("Duration must be positive").optional(),
  reason: z.string({ required_error: "Reason is required" }).trim().min(3, "Reason must be at least 3 characters"),
  attachment: z.string().nullable().optional(),
});

export const updateLeaveSchema = z.object({
  emp_id: z.number().int().optional(),
  leave_type_id: z.number().int().optional(),
  dayType: z.enum(["full_day", "half_day"]).optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  duration: z.number().positive("Duration must be positive").optional(),
  reason: z.string().trim().min(3, "Reason must be at least 3 characters").optional(),
  attachment: z.string().nullable().optional(),
});

export const actionLeaveSchema = z.object({
  status: z.enum(["approved", "rejected"], {
    required_error: "Status is required and must be either 'approved' or 'rejected'",
  }),
  remark: z.string().trim().optional().nullable(),
});
