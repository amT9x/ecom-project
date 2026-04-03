# Ecom Project Backend

Production-ready ecommerce backend with Node.js, TypeScript, Fastify, PostgreSQL, Redis, BullMQ, JWT, structured logging, health checks, and metrics.

## Quick Start

1. Copy `.env.example` to `.env`.
2. Install dependencies:
   - `npm install`
3. Run local development:
   - `npm run dev`

## Docker

From project root:

- `docker compose -f docker/docker-compose.yml up --build`

## Prisma Workflow

- Generate Prisma client: `npm run db:generate`
- Apply dev migration: `npm run db:migrate:dev`
- Apply migration in deploy flow: `npm run db:migrate:deploy`
- Seed database: `npm run db:seed`

## Integration + Smoke Tests (one command)

- Run all tests with Docker test services: `npm run test:all`
- This command:
  - starts `docker/docker-compose.test.yml`
  - applies Prisma migrations
  - seeds test data
  - runs integration tests
  - runs smoke test
  - tears down test containers

## API Base URL

- `http://localhost:3000/api/v1`

## Main Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me`
- `PATCH /users/me`
- `POST /products`
- `GET /products`
- `PATCH /products/:productId`
- `PUT /inventories`
- `GET /inventories/:productId`
- `POST /orders` (requires `idempotency-key` header)
- `POST /payments`
- `GET /health`
- `GET /metrics`
