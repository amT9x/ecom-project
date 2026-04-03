import { pgPool } from "../../core/database/postgres";

export class UserRepository {
  async getById(id: string) {
    const result = await pgPool.query("SELECT id, email, full_name, created_at FROM users WHERE id = $1", [id]);
    return result.rows[0] ?? null;
  }

  async updateName(id: string, fullName: string) {
    const result = await pgPool.query(
      "UPDATE users SET full_name = $2 WHERE id = $1 RETURNING id, email, full_name, created_at",
      [id, fullName]
    );
    return result.rows[0] ?? null;
  }
}
