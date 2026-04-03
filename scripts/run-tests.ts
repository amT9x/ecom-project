import { spawnSync } from "node:child_process";

function run(command: string, args: string[], extraEnv?: Record<string, string>): void {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, ...extraEnv }
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

function runSafe(command: string, args: string[]): void {
  spawnSync(command, args, { stdio: "inherit", shell: true, env: process.env });
}

const testEnv = {
  NODE_ENV: "test",
  APP_NAME: "ecom-backend-test",
  HOST: "127.0.0.1",
  PORT: "3100",
  LOG_LEVEL: "error",
  JWT_SECRET: "test-secret-1234567890",
  JWT_EXPIRES_IN: "1h",
  POSTGRES_HOST: "127.0.0.1",
  POSTGRES_PORT: "55432",
  POSTGRES_DB: "ecom_test",
  POSTGRES_USER: "postgres",
  POSTGRES_PASSWORD: "postgres",
  REDIS_HOST: "127.0.0.1",
  REDIS_PORT: "56379",
  DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:55432/ecom_test?schema=public"
};

try {
  const dockerCheck = spawnSync("docker", ["info"], { stdio: "ignore", shell: true });
  if (dockerCheck.status !== 0) {
    throw new Error("Docker is required for test:all. Start Docker Desktop and retry.");
  }

  run("docker", ["compose", "-f", "docker/docker-compose.test.yml", "up", "-d"]);
  run("npx", ["prisma", "migrate", "deploy"], testEnv);
  run("npm", ["run", "db:seed"], testEnv);
  run("npm", ["run", "test:integration"], testEnv);
  run("npm", ["run", "test:smoke"], testEnv);
} finally {
  runSafe("docker", ["compose", "-f", "docker/docker-compose.test.yml", "down", "-v"]);
}
