import { z } from "zod";

export const payOrderSchema = z.object({
  orderId: z.uuid()
});
