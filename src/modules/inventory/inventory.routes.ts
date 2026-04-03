import { FastifyInstance } from "fastify";
import { authGuard } from "../../interfaces/middlewares/auth-guard";
import { getInventoryController, upsertInventoryController } from "./inventory.controller";

export async function registerInventoryRoutes(app: FastifyInstance): Promise<void> {
  app.put("/inventories", { preHandler: authGuard }, upsertInventoryController);
  app.get("/inventories/:productId", getInventoryController);
}
