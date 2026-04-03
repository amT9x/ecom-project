import { z } from "zod";

export const updateUserSchema = z.object({
  fullName: z.string().min(2)
});
