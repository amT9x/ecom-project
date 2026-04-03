import { FastifyInstance } from "fastify";
import { registerHealthRoutes } from "./system.routes";
import { registerAuthRoutes } from "../../modules/auth/auth.routes";
import { registerUserRoutes } from "../../modules/user/user.routes";
import { registerProductRoutes } from "../../modules/product/product.routes";
import { registerInventoryRoutes } from "../../modules/inventory/inventory.routes";
import { registerOrderRoutes } from "../../modules/order/order.routes";
import { registerPaymentRoutes } from "../../modules/payment/payment.routes";

export async function appRoutes(app: FastifyInstance): Promise<void> {
  await registerHealthRoutes(app);
  await registerAuthRoutes(app);
  await registerUserRoutes(app);
  await registerProductRoutes(app);
  await registerInventoryRoutes(app);
  await registerOrderRoutes(app);
  await registerPaymentRoutes(app);
}
