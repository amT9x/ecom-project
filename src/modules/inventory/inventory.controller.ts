import { FastifyReply, FastifyRequest } from "fastify";
import { upsertInventorySchema } from "./inventory.schema";
import { InventoryService } from "./inventory.service";

const service = new InventoryService();

export async function upsertInventoryController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = upsertInventorySchema.parse(request.body);
  const inventory = await service.upsert(body.productId, body.quantity);
  reply.send(inventory);
}

export async function getInventoryController(
  request: FastifyRequest<{ Params: { productId: string } }>,
  reply: FastifyReply
): Promise<void> {
  const inventory = await service.get(request.params.productId);
  reply.send(inventory ?? { productId: request.params.productId, quantity: 0 });
}
