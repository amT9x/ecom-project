import { app } from "../src/app";
import { initDatabase } from "../src/core/database/postgres";
import { initRedis } from "../src/core/cache/redis";
import { bootstrapSchema } from "../src/core/database/bootstrap";

async function main(): Promise<void> {
  await initDatabase();
  await initRedis();
  await bootstrapSchema();
  await app.listen({ host: "127.0.0.1", port: 0 });

  const address = app.server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to resolve server address");
  }

  const healthRes = await fetch(`http://127.0.0.1:${address.port}/api/v1/health`);
  if (!healthRes.ok) {
    throw new Error(`Smoke test failed with status ${healthRes.status}`);
  }

  const health = (await healthRes.json()) as { status: string };
  if (health.status !== "ok" && health.status !== "degraded") {
    throw new Error("Smoke test received invalid health payload");
  }

  await app.close();
  process.stdout.write("Smoke test passed\n");
}

main().catch(async (error) => {
  await app.close().catch(() => undefined);
  process.stderr.write(`${error instanceof Error ? error.message : "Smoke test failed"}\n`);
  process.exit(1);
});
