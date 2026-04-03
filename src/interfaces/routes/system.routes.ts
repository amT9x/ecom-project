import { FastifyInstance } from "fastify";
import { performance } from "node:perf_hooks";
import { pgPool, getPoolStats } from "../../core/database/postgres";
import { redis } from "../../core/cache/redis";
import { dbPoolGauge, eventLoopLagGauge, metricsRegistry } from "../../infrastructure/metrics";

let lagMs = 0;
let last = performance.now();
setInterval(() => {
  const now = performance.now();
  lagMs = Math.max(0, now - last - 1000);
  last = now;
  eventLoopLagGauge.set(lagMs);
}, 1000).unref();

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async () => {
    let dbOk = false;
    let redisOk = false;
    try {
      await pgPool.query("SELECT 1");
      dbOk = true;
    } catch {
      dbOk = false;
    }
    try {
      await redis.ping();
      redisOk = true;
    } catch {
      redisOk = false;
    }
    const pool = getPoolStats();
    dbPoolGauge.labels("total").set(pool.total);
    dbPoolGauge.labels("idle").set(pool.idle);
    dbPoolGauge.labels("waiting").set(pool.waiting);

    return {
      status: dbOk && redisOk ? "ok" : "degraded",
      dependencies: { postgres: dbOk, redis: redisOk },
      eventLoopLagMs: lagMs,
      dbPool: pool
    };
  });

  app.get("/livez", async () => ({ status: "alive" }));
  app.get("/readyz", async () => ({ status: "ready" }));
  app.get("/metrics", async (_, reply) => {
    const payload = await metricsRegistry.metrics();
    reply.header("Content-Type", metricsRegistry.contentType);
    return reply.send(payload);
  });
}
