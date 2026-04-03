import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { AppError } from "../../core/errors/app-error";
import { pgPool } from "../../core/database/postgres";
import { AuthRepository } from "./auth.repository";
import { env } from "../../config/env";

export class AuthService {
  private readonly repo = new AuthRepository();

  hashPassword(password: string): string {
    const salt = randomUUID();
    const hash = scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
  }

  verifyPassword(password: string, hashed: string): boolean {
    const [salt, hash] = hashed.split(":");
    const candidate = scryptSync(password, salt, 64).toString("hex");
    return timingSafeEqual(Buffer.from(hash), Buffer.from(candidate));
  }

  async register(input: { email: string; password: string; fullName: string }): Promise<{ id: string; email: string }> {
    const exists = await this.repo.findByEmail(input.email);
    if (exists) throw new AppError("Email already exists", 409);

    const id = randomUUID();
    const passwordHash = this.hashPassword(input.password);
    await pgPool.query(
      "INSERT INTO users (id, email, password_hash, full_name) VALUES ($1, $2, $3, $4)",
      [id, input.email, passwordHash, input.fullName]
    );

    return { id, email: input.email };
  }

  async login(input: { email: string; password: string }): Promise<{ userId: string; email: string; expiresIn: string }> {
    const user = await this.repo.findByEmail(input.email);
    if (!user || !this.verifyPassword(input.password, user.password_hash)) {
      throw new AppError("Invalid credentials", 401);
    }
    return { userId: user.id, email: user.email, expiresIn: env.JWT_EXPIRES_IN };
  }
}
