import { InventoryRepository } from "./inventory.repository";

export class InventoryService {
  private readonly repo = new InventoryRepository();

  upsert(productId: string, quantity: number) {
    return this.repo.upsert(productId, quantity);
  }

  get(productId: string) {
    return this.repo.getByProduct(productId);
  }
}
