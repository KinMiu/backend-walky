import {z} from "zod";

export const createTodoSchema = z.object({
  title: z
    .string({required_error: "Title is required"})
    .min(1, "Title cannot be empty")
    .max(255, "Title must not exceed 255 characters")
    .trim(),
  description: z.string().max(1000, "Description must not exceed 1000 characters").optional().nullable(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().default("MEDIUM"),
  dueDate: z
    .string()
    .datetime({message: "dueDate must be a valid ISO 8601 date string"})
    .optional()
    .nullable(),
});

export const updateTodoSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(255, "Title must not exceed 255 characters")
    .trim()
    .optional(),
  description: z.string().max(1000, "Description must not exceed 1000 characters").optional().nullable(),
  isCompleted: z.boolean().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  dueDate: z
    .string()
    .datetime({message: "dueDate must be a valid ISO 8601 date string"})
    .optional()
    .nullable(),
});

export const queryTodoSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  isCompleted: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "title", "dueDate", "priority"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
