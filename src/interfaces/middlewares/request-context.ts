import { FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";

export async function requestContext(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const requestId = (request.headers["x-request-id"] as string) || randomUUID();
  reply.header("x-request-id", requestId);
  (request as FastifyRequest & { requestId: string }).requestId = requestId;
}
