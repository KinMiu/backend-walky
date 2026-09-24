import {z} from "zod";

export const registerSchema = z.object({
  username: z
    .string({required_error: "Username is required"})
    .min(3, "Username must be at least 3 characters long")
    .max(50, "Username must not exceed 50 characters")
    .trim(),
  email: z
    .string({required_error: "Email is required"})
    .email("Invalid email address format")
    .max(100, "Email must not exceed 100 characters")
    .trim()
    .toLowerCase(),
  password: z
    .string({required_error: "Password is required"})
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password must not exceed 100 characters"),
});

export const loginSchema = z.object({
  email: z
    .string({required_error: "Email is required"})
    .email("Invalid email address format")
    .trim()
    .toLowerCase(),
  password: z
    .string({required_error: "Password is required"})
    .min(1, "Password cannot be empty"),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({required_error: "Current password is required"})
    .min(1, "Current password cannot be empty"),
  newPassword: z
    .string({required_error: "New password is required"})
    .min(6, "New password must be at least 6 characters long")
    .max(100, "New password must not exceed 100 characters"),
});
