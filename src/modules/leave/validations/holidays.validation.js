import { z } from "zod";

export const createHolidaySchema = z.object({
  name: z.string({ required_error: "Holiday name is required" }).trim().min(2, "Holiday name must be at least 2 characters"),
  flexible: z.boolean().optional().default(false),
  startDate: z.string({ required_error: "Start date is required" }),
  endDate: z.string({ required_error: "End date is required" }),
  leaveProfile: z.array(z.number().int()).optional().default([]),
});

export const updateHolidaySchema = z.object({
  name: z.string().trim().min(2, "Holiday name must be at least 2 characters").optional(),
  flexible: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  leaveProfile: z.array(z.number().int()).optional(),
});
