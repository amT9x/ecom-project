import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_NAME: z.string().default("ecom-backend"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.string().default("info"),
  JWT_SECRET: z.string().min(16).default("super-secret-change-me"),
  JWT_EXPIRES_IN: z.string().default("1h"),
  POSTGRES_HOST: z.string().default("localhost"),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_DB: z.string().default("ecom"),
  POSTGRES_USER: z.string().default("postgres"),
  POSTGRES_PASSWORD: z.string().default("postgres"),
  POSTGRES_POOL_MIN: z.coerce.number().int().nonnegative().default(2),
  POSTGRES_POOL_MAX: z.coerce.number().int().positive().default(20),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  METRICS_ENABLED: z.coerce.boolean().default(true)
});

export const env = envSchema.parse(process.env);
