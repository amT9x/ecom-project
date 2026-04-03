import { env } from "./config/env";
import { logger } from "./core/logger/logger";
import { initDatabase } from "./core/database/postgres";
import { initRedis } from "./core/cache/redis";
import { bootstrapSchema } from "./core/database/bootstrap";
import { app } from "./app";

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

  await app.listen({
    host: env.HOST,
    port: env.PORT
  });

  logger.info({ host: env.HOST, port: env.PORT }, "Server started");
}

start().catch((error) => {
  logger.error({ err: error }, "Bootstrap failure");
  process.exit(1);
});
