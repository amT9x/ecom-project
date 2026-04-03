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
import { pgPool } from "../../core/database/postgres";
import { redis } from "../../core/cache/redis";

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

  app.get("/health", async () => ({
    status: "ok",
    service: "ecom-backend",
    uptime: process.uptime(),
    timestamp: Date.now()
  }));

  app.get("/ready", async (_, reply) => {
    let postgresUp = true;
    let redisUp = true;

    try {
      await pgPool.query("SELECT 1");
    } catch {
      postgresUp = false;
    }

    try {
      await redis.ping();
    } catch {
      redisUp = false;
    }

    if (postgresUp && redisUp) {
      return reply.status(200).send({
        status: "ready",
        dependencies: {
          postgres: "up",
          redis: "up"
        },
        timestamp: Date.now()
      });
    }

    return reply.status(503).send({
      status: "not_ready",
      dependencies: {
        postgres: postgresUp ? "up" : "down",
        redis: redisUp ? "up" : "down"
      }
    });
  });

  app.register(appRoutes, { prefix: "/api/v1" });
  return app;
}
