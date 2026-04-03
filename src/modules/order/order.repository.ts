import { PoolClient } from "pg";
import { randomUUID } from "node:crypto";

export class OrderRepository {
  async createOrder(
    client: PoolClient,
    input: { userId: string; totalCents: number; idempotencyKey: string }
  ): Promise<string> {
    const orderId = randomUUID();
    await client.query(
      "INSERT INTO orders (id, user_id, status, total_cents, idempotency_key) VALUES ($1, $2, 'PENDING', $3, $4)",
      [orderId, input.userId, input.totalCents, input.idempotencyKey]
    );
    return orderId;
  }

  async insertOrderItem(
    client: PoolClient,
    input: { orderId: string; productId: string; quantity: number; unitPriceCents: number }
  ): Promise<void> {
    await client.query(
      "INSERT INTO order_items (id, order_id, product_id, quantity, unit_price_cents) VALUES ($1, $2, $3, $4, $5)",
      [randomUUID(), input.orderId, input.productId, input.quantity, input.unitPriceCents]
    );
  }
}
