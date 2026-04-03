import { AppError } from "../../core/errors/app-error";
import { ProductRepository } from "./product.repository";

export class ProductService {
  private readonly repo = new ProductRepository();

  create(input: { sku: string; name: string; priceCents: number }) {
    return this.repo.create(input);
  }

  list() {
    return this.repo.list();
  }

  async update(id: string, input: { name: string; priceCents: number; version: number }) {
    const updated = await this.repo.updateOptimistic(id, input);
    if (!updated) throw new AppError("Product version conflict or not found", 409);
    return updated;
  }
}
