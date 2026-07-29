import { z } from "zod";

export const createStateSchema = z.object({
  name: z.string().trim().min(2, "State name must be at least 2 characters"),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export const updateStateSchema = z.object({
  name: z.string().trim().min(2, "State name must be at least 2 characters").optional(),
  status: z.enum(["active", "inactive"]).optional(),
});
