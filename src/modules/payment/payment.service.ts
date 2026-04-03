import { emailQueue } from "../../core/queue/queue";
import { AppError } from "../../core/errors/app-error";
import { pgPool } from "../../core/database/postgres";
import { PaymentRepository } from "./payment.repository";

export class PaymentService {
  private readonly repo = new PaymentRepository();

  async requestPayment(orderId: string) {
    const order = await pgPool.query("SELECT * FROM orders WHERE id = $1", [orderId]);
    if (!order.rows[0]) throw new AppError("Order not found", 404);

    const payment = await this.repo.upsertForOrder(orderId, Number(order.rows[0].total_cents));

    await emailQueue.add(
      "payment-notification",
      { orderId, status: payment.status },
      { attempts: 5, backoff: { type: "exponential", delay: 1000 } }
    );

    return payment;
  }
}
