import { z } from "zod";

export const createTaskSchema = z.object({
  taskType: z.union([z.string().min(1, "Task type is required"), z.number()]),
  customerId: z.coerce.number().int("Customer ID must be a valid integer"),
  description: z.string().min(1, "Description is required"),
  priority: z.string().optional().nullable(),
  assigneeToEmployeeId: z.coerce
    .number()
    .int("Assignee employee ID must be a valid integer")
    .optional()
    .nullable(),
  startDateTime: z.coerce.date().optional().nullable(),
  endDateTime: z.coerce.date().optional().nullable(),
  repeat: z.boolean().optional().nullable(),
  frequency: z.enum(["hour", "day", "week", "month", "year"]).optional().nullable(),
  interval: z.coerce.number().int().optional().nullable(),
  time: z.string().optional().nullable(),
  payment_type: z.coerce.number().optional().nullable(),
  additionalFields: z.union([z.record(z.any()), z.array(z.any())]).optional().nullable(),
  createdBy: z.coerce.number().int().optional().nullable(),
  updatedBy: z.coerce.number().int().optional().nullable(),
});

export const updateTaskSchema = z.object({
  taskType: z.union([z.string().min(1, "Task type is required"), z.number()]).optional(),
  customerId: z.coerce.number().int("Customer ID must be a valid integer").optional(),
  description: z.string().min(1, "Description is required").optional(),
  priority: z.string().optional().nullable(),
  assigneeToEmployeeId: z.coerce
    .number()
    .int("Assignee employee ID must be a valid integer")
    .optional()
    .nullable(),
  startDateTime: z.coerce.date().optional().nullable(),
  endDateTime: z.coerce.date().optional().nullable(),
  repeat: z.boolean().optional().nullable(),
  frequency: z.enum(["hour", "day", "week", "month", "year"]).optional().nullable(),
  interval: z.coerce.number().int().optional().nullable(),
  time: z.string().optional().nullable(),
  payment_type: z.coerce.number().optional().nullable(),
  additionalFields: z.union([z.record(z.any()), z.array(z.any())]).optional().nullable(),
  createdBy: z.coerce.number().int().optional().nullable(),
  updatedBy: z.coerce.number().int().optional().nullable(),
});
