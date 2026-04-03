import { Pool } from "pg";
import { env } from "../../config/env";
import { logger } from "../logger/logger";

export const pgPool = new Pool({
  host: env.POSTGRES_HOST,
  port: env.POSTGRES_PORT,
  database: env.POSTGRES_DB,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  min: env.POSTGRES_POOL_MIN,
  max: env.POSTGRES_POOL_MAX
});

export async function initDatabase(): Promise<void> {
  await pgPool.query("SELECT 1");
  logger.info("PostgreSQL connected");
}

export function getPoolStats(): Record<string, number> {
  return {
    total: pgPool.totalCount,
    idle: pgPool.idleCount,
    waiting: pgPool.waitingCount
  };
}
