import { AppError } from "../../core/errors/app-error";
import { UserRepository } from "./user.repository";

export class UserService {
  private readonly repo = new UserRepository();

  async getProfile(userId: string) {
    const user = await this.repo.getById(userId);
    if (!user) throw new AppError("User not found", 404);
    return user;
  }

  async updateProfile(userId: string, fullName: string) {
    const user = await this.repo.updateName(userId, fullName);
    if (!user) throw new AppError("User not found", 404);
    return user;
  }
}
