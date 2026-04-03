import { FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../core/errors/app-error";
import { createOrderSchema } from "./order.schema";
import { OrderService } from "./order.service";

const service = new OrderService();

export async function createOrderController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = createOrderSchema.parse(request.body);
  const idempotencyKey = request.headers["idempotency-key"];
  if (!idempotencyKey || Array.isArray(idempotencyKey)) {
    throw new AppError("Missing idempotency-key header", 400);
  }
  const order = await service.createOrder({
    userId: request.user.sub,
    items: body.items,
    idempotencyKey
  });
  reply.status(201).send(order);
}
