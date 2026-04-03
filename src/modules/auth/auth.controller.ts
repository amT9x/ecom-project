import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service";
import { loginSchema, registerSchema } from "./auth.schema";

const service = new AuthService();

export async function registerController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const input = registerSchema.parse(request.body);
  const user = await service.register(input);
  const token = await reply.jwtSign({ sub: user.id, email: user.email });
  reply.status(201).send({ user, accessToken: token });
}

export async function loginController(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const input = loginSchema.parse(request.body);
  const session = await service.login(input);
  const token = await reply.jwtSign({ sub: session.userId, email: session.email });
  reply.send({ accessToken: token, expiresIn: session.expiresIn });
}
