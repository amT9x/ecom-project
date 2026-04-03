import { FastifyReply, FastifyRequest } from "fastify";
import { updateUserSchema } from "./user.schema";
import { UserService } from "./user.service";

const service = new UserService();

export async function getMeController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const me = await service.getProfile(request.user.sub);
  reply.send(me);
}

export async function updateMeController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const body = updateUserSchema.parse(request.body);
  const me = await service.updateProfile(request.user.sub, body.fullName);
  reply.send(me);
}
