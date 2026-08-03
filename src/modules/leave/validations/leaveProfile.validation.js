import { z } from "zod";

export const createLeaveProfileSchema = z.object({
  name: z.string({ required_error: "Leave profile name is required" }).trim().min(2, "Leave profile name must be at least 2 characters"),
});

export const updateLeaveProfileSchema = z.object({
  name: z.string().trim().min(2, "Leave profile name must be at least 2 characters").optional(),
});
