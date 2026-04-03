import { z } from "zod";

export const upsertInventorySchema = z.object({
  productId: z.uuid(),
  quantity: z.number().int().nonnegative()
});
