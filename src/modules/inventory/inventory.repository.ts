import { pgPool } from "../../core/database/postgres";

export class InventoryRepository {
  async upsert(productId: string, quantity: number) {
    const result = await pgPool.query(
      `INSERT INTO inventories (product_id, quantity)
       VALUES ($1, $2)
       ON CONFLICT (product_id)
       DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = NOW()
       RETURNING *`,
      [productId, quantity]
    );
    return result.rows[0];
  }

  async getByProduct(productId: string) {
    const result = await pgPool.query("SELECT * FROM inventories WHERE product_id = $1", [productId]);
    return result.rows[0] ?? null;
  }
}
