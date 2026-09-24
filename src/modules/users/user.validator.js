import {z} from "zod";

export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(50, "Username must not exceed 50 characters")
    .trim()
    .optional(),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must not exceed 50 characters")
    .trim()
    .optional(),
  email: z
    .string()
    .email("Invalid email address format")
    .max(100, "Email must not exceed 100 characters")
    .trim()
    .toLowerCase()
    .optional(),
  isActive: z.boolean().optional(),
});

export const updateRoleSchema = z.object({
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MEMBER"], {
    required_error: "Role is required and must be SUPER_ADMIN, ADMIN, or MEMBER",
  }),
});

export const queryUserSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "MEMBER"]).optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});
