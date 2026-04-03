import { randomUUID, scryptSync } from "node:crypto";
import { Pool } from "pg";

function hashPassword(password: string): string {
  const salt = randomUUID();
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for seed");
  }

  const pool = new Pool({ connectionString: databaseUrl });

  const userId = randomUUID();
  const productId = randomUUID();

  await pool.query(
    `INSERT INTO users (id, email, password_hash, full_name)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    [userId, "seed.user@ecom.local", hashPassword("Password123!"), "Seed User"]
  );

  await pool.query(
    `INSERT INTO products (id, sku, name, price_cents, version)
     VALUES ($1, $2, $3, $4, 0)
     ON CONFLICT (sku) DO NOTHING`,
    [productId, "SEED-SKU-001", "Seed Product", 199900]
  );

  await pool.query(
    `INSERT INTO inventories (product_id, quantity)
     VALUES ($1, $2)
     ON CONFLICT (product_id) DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = NOW()`,
    [productId, 100]
  );

  await pool.end();
  process.stdout.write("Seed completed successfully\n");
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Seed failed"}\n`);
  process.exit(1);
});
