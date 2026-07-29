import { z } from "zod";

export const createBranchSchema = z.object({
  name: z.string().trim().min(2, "Branch name must be at least 2 characters"),
  state_id: z.coerce.number({ invalid_type_error: "State ID must be a number", required_error: "State ID is required" }),
  region_id: z.coerce.number({ invalid_type_error: "Region ID must be a number", required_error: "Region ID is required" }),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export const updateBranchSchema = z.object({
  name: z.string().trim().min(2, "Branch name must be at least 2 characters").optional(),
  state_id: z.coerce.number({ invalid_type_error: "State ID must be a number" }).optional(),
  region_id: z.coerce.number({ invalid_type_error: "Region ID must be a number" }).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});
