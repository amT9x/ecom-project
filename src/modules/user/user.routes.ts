import { FastifyInstance } from "fastify";
import { authGuard } from "../../interfaces/middlewares/auth-guard";
import { getMeController, updateMeController } from "./user.controller";

export async function registerUserRoutes(app: FastifyInstance): Promise<void> {
  app.get("/users/me", { preHandler: authGuard }, getMeController);
  app.patch("/users/me", { preHandler: authGuard }, updateMeController);
}
