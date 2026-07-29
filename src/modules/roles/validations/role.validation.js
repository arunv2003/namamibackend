import { z } from "zod";

export const modulePermissionSchema = z.object({
  add: z.boolean().optional().default(false),
  allView: z.boolean().optional().default(false),
  ownView: z.boolean().optional().default(false),
  edit: z.boolean().optional().default(false),
  delete: z.boolean().optional().default(false),
}).passthrough();

export const permissionSchema = z.record(z.string(), modulePermissionSchema);

export const createRoleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  status: z.enum(["active", "inactive"]).optional(),
  permission: z.union([permissionSchema, z.record(z.string(), z.any())]).optional(),
  createdBy: z.number().optional(),
  updatedBy: z.number().optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  status: z.enum(["active", "inactive"]).optional(),
  permission: z.union([permissionSchema, z.record(z.string(), z.any())]).optional(),
  updatedBy: z.number().optional(),
});
