import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { env } from "../../config/env";

export const jwtPlugin = fp(async (app) => {
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET
  });
});
