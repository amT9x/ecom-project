import { FastifyReply, FastifyRequest } from "fastify";
import { payOrderSchema } from "./payment.schema";
import { PaymentService } from "./payment.service";

const service = new PaymentService();

export async function payOrderController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = payOrderSchema.parse(request.body);
  const payment = await service.requestPayment(body.orderId);
  reply.status(202).send(payment);
}
