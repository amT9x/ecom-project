import { randomUUID } from "node:crypto";
import { pgPool } from "../../core/database/postgres";

export class PaymentRepository {
  async upsertForOrder(orderId: string, amountCents: number) {
    const existing = await pgPool.query("SELECT * FROM payments WHERE order_id = $1", [orderId]);
    if (existing.rows[0]) return existing.rows[0];

    const id = randomUUID();
    const result = await pgPool.query(
      "INSERT INTO payments (id, order_id, status, amount_cents, provider_ref, retry_count) VALUES ($1, $2, 'PROCESSING', $3, $4, 0) RETURNING *",
      [id, orderId, amountCents, `PAY-${Date.now()}`]
    );
    return result.rows[0];
  }

  async markSucceeded(orderId: string) {
    await pgPool.query("UPDATE payments SET status = 'SUCCEEDED' WHERE order_id = $1", [orderId]);
    await pgPool.query("UPDATE orders SET status = 'PAID' WHERE id = $1", [orderId]);
  }
}
