import { z } from "zod";

export const createProductSchema = z.object({
  sku: z.string().min(3),
  name: z.string().min(2),
  priceCents: z.number().int().nonnegative()
});

export const updateProductSchema = z.object({
  name: z.string().min(2),
  priceCents: z.number().int().nonnegative(),
  version: z.number().int().nonnegative()
});
