import { randomUUID } from "node:crypto";
import { pgPool } from "../../core/database/postgres";

export class ProductRepository {
  async create(input: { sku: string; name: string; priceCents: number }) {
    const id = randomUUID();
    const result = await pgPool.query(
      "INSERT INTO products (id, sku, name, price_cents) VALUES ($1, $2, $3, $4) RETURNING *",
      [id, input.sku, input.name, input.priceCents]
    );
    return result.rows[0];
  }

  async list() {
    const result = await pgPool.query("SELECT * FROM products ORDER BY created_at DESC");
    return result.rows;
  }

  async updateOptimistic(id: string, input: { name: string; priceCents: number; version: number }) {
    const result = await pgPool.query(
      "UPDATE products SET name = $2, price_cents = $3, version = version + 1 WHERE id = $1 AND version = $4 RETURNING *",
      [id, input.name, input.priceCents, input.version]
    );
    return result.rows[0] ?? null;
  }
}
