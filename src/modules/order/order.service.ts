import { AppError } from "../../core/errors/app-error";
import { pgPool } from "../../core/database/postgres";
import { OrderRepository } from "./order.repository";

export class OrderService {
  private readonly repo = new OrderRepository();

  async createOrder(input: { userId: string; items: Array<{ productId: string; quantity: number }>; idempotencyKey: string }) {
    const existing = await pgPool.query("SELECT id, status, total_cents FROM orders WHERE idempotency_key = $1", [input.idempotencyKey]);
    if (existing.rows[0]) return existing.rows[0];

    const client = await pgPool.connect();
    try {
      await client.query("BEGIN");
      let totalCents = 0;

      for (const item of input.items) {
        const p = await client.query("SELECT price_cents FROM products WHERE id = $1", [item.productId]);
        if (!p.rows[0]) throw new AppError("Product not found", 404);

        const inv = await client.query("SELECT quantity FROM inventories WHERE product_id = $1 FOR UPDATE", [item.productId]);
        const current = Number(inv.rows[0]?.quantity ?? 0);
        if (current < item.quantity) throw new AppError("Insufficient inventory", 409);

        await client.query("UPDATE inventories SET quantity = quantity - $2 WHERE product_id = $1", [item.productId, item.quantity]);
        totalCents += Number(p.rows[0].price_cents) * item.quantity;
      }

      const orderId = await this.repo.createOrder(client, {
        userId: input.userId,
        totalCents,
        idempotencyKey: input.idempotencyKey
      });

      for (const item of input.items) {
        const p = await client.query("SELECT price_cents FROM products WHERE id = $1", [item.productId]);
        await this.repo.insertOrderItem(client, {
          orderId,
          productId: item.productId,
          quantity: item.quantity,
          unitPriceCents: Number(p.rows[0].price_cents)
        });
      }

      await client.query("COMMIT");
      return { id: orderId, status: "PENDING", total_cents: totalCents };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
