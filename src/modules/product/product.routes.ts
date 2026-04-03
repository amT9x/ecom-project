import { FastifyInstance } from "fastify";
import { authGuard } from "../../interfaces/middlewares/auth-guard";
import { createProductController, listProductController, updateProductController } from "./product.controller";

export async function registerProductRoutes(app: FastifyInstance): Promise<void> {
  app.post("/products", { preHandler: authGuard }, createProductController);
  app.get("/products", listProductController);
  app.patch("/products/:productId", { preHandler: authGuard }, updateProductController);
}
