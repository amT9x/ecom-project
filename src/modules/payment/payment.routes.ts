import { FastifyInstance } from "fastify";
import { authGuard } from "../../interfaces/middlewares/auth-guard";
import { payOrderController } from "./payment.controller";

export async function registerPaymentRoutes(app: FastifyInstance): Promise<void> {
  app.post("/payments", { preHandler: authGuard }, payOrderController);
}
