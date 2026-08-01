import { z } from "zod";

export const createLeaveTypeSchema = z.object({
  name: z.string({ required_error: "Leave type name is required" }).trim().min(2, "Leave type name must be at least 2 characters"),
  fullDay: z.boolean().optional().default(true),
  halfDay: z.boolean().optional().default(false),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  totalLeave: z.number().nonnegative("Total leave must be 0 or greater").optional().default(0),
  openingBalance: z.number().nonnegative("Opening balance must be 0 or greater").optional().default(0),
  timeInterval: z.string().optional().default("FLAT"),
  monthlyCreditDay: z.number().int().optional().default(1),
  compOff: z.boolean().optional().default(false),
  birthdayLeave: z.boolean().optional().default(false),
  reason: z.boolean().optional().default(false),
  hideFromSummary: z.boolean().optional().default(false),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export const updateLeaveTypeSchema = z.object({
  name: z.string().trim().min(2, "Leave type name must be at least 2 characters").optional(),
  fullDay: z.boolean().optional(),
  halfDay: z.boolean().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  totalLeave: z.number().nonnegative("Total leave must be 0 or greater").optional(),
  openingBalance: z.number().nonnegative("Opening balance must be 0 or greater").optional(),
  timeInterval: z.string().optional(),
  monthlyCreditDay: z.number().int().optional(),
  compOff: z.boolean().optional(),
  birthdayLeave: z.boolean().optional(),
  reason: z.boolean().optional(),
  hideFromSummary: z.boolean().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});
