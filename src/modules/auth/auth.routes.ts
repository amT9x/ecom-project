import { FastifyInstance } from "fastify";
import { loginController, registerController } from "./auth.controller";

export async function registerAuthRoutes(app: FastifyInstance): Promise<void> {
  app.post("/auth/register", registerController);
  app.post("/auth/login", loginController);
}
