import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import { logger } from "../../core/logger/logger";
import { jwtPlugin } from "../../core/security/jwt";
import { appRoutes } from "../routes";
import { httpDurationMs } from "../../infrastructure/metrics";
import { AppError } from "../../core/errors/app-error";
import { requestContext } from "../middlewares/request-context";

export function buildApp() {
  const app = Fastify({ loggerInstance: logger });

  app.addHook("onRequest", requestContext);

  app.addHook("onResponse", async (request, reply) => {
    const route = request.routeOptions.url || request.url;
    httpDurationMs.labels(request.method, route, String(reply.statusCode)).observe(reply.elapsedTime);
  });

  app.register(cors);
  app.register(helmet);
  app.register(sensible);
  app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
  app.register(jwtPlugin);

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ message: error.message });
    }
    request.log.error({ err: error }, "Unhandled error");
    return reply.status(500).send({ message: "Internal server error" });
  });

  app.register(appRoutes, { prefix: "/api/v1" });
  return app;
}
