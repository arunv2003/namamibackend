import { z } from "zod";

export const createLeaveTypeSchema = z.object({
  name: z
    .string({ required_error: "Leave type name is required" })
    .trim()
    .min(2, "Leave type name must be at least 2 characters")
    .max(200, "Leave type name cannot exceed 200 characters"),
  type: z.enum(["paid", "unpaid"], {
    required_error: "Type (paid/unpaid) is required",
    invalid_type_error: "Type must be either 'paid' or 'unpaid'",
  }),
  code: z
    .string({ required_error: "Leave type code is required" })
    .trim()
    .min(1, "Leave type code is required")
    .max(50, "Code cannot exceed 50 characters"),
  lopdeduction: z.boolean().optional().default(false),
  leaveprofile: z.any().nullable().optional().default(null),
  description: z.string().nullable().optional(),
});

export const updateLeaveTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Leave type name must be at least 2 characters")
    .max(200, "Leave type name cannot exceed 200 characters")
    .optional(),
  type: z
    .enum(["paid", "unpaid"], {
      invalid_type_error: "Type must be either 'paid' or 'unpaid'",
    })
    .optional(),
  code: z
    .string()
    .trim()
    .min(1, "Leave type code cannot be empty")
    .max(50, "Code cannot exceed 50 characters")
    .optional(),
  lopdeduction: z.boolean().optional(),
  leaveprofile: z.any().nullable().optional(),
  description: z.string().nullable().optional(),
});

