import { FastifyInstance } from "fastify";
import { authGuard } from "../../interfaces/middlewares/auth-guard";
import { createOrderController } from "./order.controller";

export async function registerOrderRoutes(app: FastifyInstance): Promise<void> {
  app.post("/orders", { preHandler: authGuard }, createOrderController);
}
