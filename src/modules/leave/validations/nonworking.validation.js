import { z } from "zod";

export const createNonWorkingDaySchema = z.object({
  name: z.string({ required_error: "Name is required" }).trim().min(2, "Name must be at least 2 characters"),
  week: z.string({ required_error: "Week specification is required" }).trim(),
  day: z.string({ required_error: "Day is required" }).trim(),
  date: z.string().nullable().optional(),
  leaveProfile: z.array(z.number().int()).optional().default([]),
  afterapplicableDate: z.string().nullable().optional(),
  beforeapplicableDate: z.string().nullable().optional(),
});

export const updateNonWorkingDaySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
  week: z.string().trim().optional(),
  day: z.string().trim().optional(),
  date: z.string().nullable().optional(),
  leaveProfile: z.array(z.number().int()).optional(),
  afterapplicableDate: z.string().nullable().optional(),
  beforeapplicableDate: z.string().nullable().optional(),
});
