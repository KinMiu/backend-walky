import {z} from "zod";

export const joinRoomSchema = z.object({
  pin_code: z
    .string({required_error: "PIN code is required"})
    .regex(/^\d{4}$/, "PIN code must be a 4-digit number (0000-9999)"),
});
