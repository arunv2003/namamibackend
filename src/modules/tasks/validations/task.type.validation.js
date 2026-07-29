import { z } from "zod";

export const createTaskTypeSchema = z.object({
  name: z.string().trim().min(2, "Task type name must be at least 2 characters"),
});

export const updateTaskTypeSchema = z.object({
  name: z.string().trim().min(2, "Task type name must be at least 2 characters").optional(),
});
