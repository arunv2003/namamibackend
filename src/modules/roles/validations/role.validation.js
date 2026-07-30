import { z } from "zod";

export const permissionSchema = z.record(z.string(), z.any());

export const createRoleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  status: z.enum(["active", "inactive"]).optional(),
  permission: permissionSchema.optional(),
  createdBy: z.number().optional(),
  updatedBy: z.number().optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  status: z.enum(["active", "inactive"]).optional(),
  permission: permissionSchema.optional(),
  updatedBy: z.number().optional(),
});

