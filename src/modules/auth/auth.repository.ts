import { pgPool } from "../../core/database/postgres";

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
};

export class AuthRepository {
  async findByEmail(email: string): Promise<UserRow | null> {
    const result = await pgPool.query<UserRow>("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0] ?? null;
  }
}
