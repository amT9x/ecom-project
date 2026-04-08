import { env } from "./config/env";
import { logger } from "./core/logger/logger";
import { initDatabase } from "./core/database/postgres";
import { initRedis } from "./core/cache/redis";
import { bootstrapSchema } from "./core/database/bootstrap";
import { app } from "./app";
import { startMetricsCollector } from "./infrastructure/metrics.collector";

async function start(): Promise<void> {
  try {
    await initDatabase();
    await bootstrapSchema();
  } catch (error) {
    logger.warn({ err: error }, "PostgreSQL unavailable, starting in degraded mode");
  }
  try {
    await initRedis();
  } catch (error) {
    logger.warn({ err: error }, "Redis unavailable, starting in degraded mode");
  }

  startMetricsCollector();

  try {
    await app.listen({
      host: env.HOST,
      port: env.PORT
    });
    app.log.info({ host: env.HOST, port: env.PORT }, "Server started");
  } catch (err) {
    logger.error(err)
    process.exit(1);
  }
}

start().catch((error) => {
  logger.error({ err: error }, "Bootstrap failure");
  process.exit(1);
});
