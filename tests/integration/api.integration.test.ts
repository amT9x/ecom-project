import test from "node:test";
import assert from "node:assert/strict";
import { app } from "../../src/app";
import { initDatabase, pgPool } from "../../src/core/database/postgres";
import { initRedis, redis } from "../../src/core/cache/redis";
import { bootstrapSchema } from "../../src/core/database/bootstrap";

let accessToken = "";
let productId = "";
let orderId = "";

test.before(async () => {
  await initDatabase();
  await initRedis();
  await bootstrapSchema();
  await app.ready();

  await pgPool.query("TRUNCATE TABLE payments, order_items, orders, inventories, products, users CASCADE");
});

test.after(async () => {
  await app.close();
  await redis.quit();
  await pgPool.end();
});

test("register and login", async () => {
  const registerRes = await app.inject({
    method: "POST",
    url: "/api/v1/auth/register",
    payload: {
      email: "integration@ecom.local",
      password: "Password123!",
      fullName: "Integration User"
    }
  });
  assert.equal(registerRes.statusCode, 201);

  const loginRes = await app.inject({
    method: "POST",
    url: "/api/v1/auth/login",
    payload: {
      email: "integration@ecom.local",
      password: "Password123!"
    }
  });
  assert.equal(loginRes.statusCode, 200);
  accessToken = loginRes.json().accessToken as string;
  assert.ok(accessToken);
});

test("create product and inventory", async () => {
  const createProductRes = await app.inject({
    method: "POST",
    url: "/api/v1/products",
    headers: { authorization: `Bearer ${accessToken}` },
    payload: {
      sku: "INTEG-SKU-001",
      name: "Integration Product",
      priceCents: 250000
    }
  });

  assert.equal(createProductRes.statusCode, 201);
  const product = createProductRes.json() as { id: string };
  productId = product.id;
  assert.ok(productId);

  const inventoryRes = await app.inject({
    method: "PUT",
    url: "/api/v1/inventories",
    headers: { authorization: `Bearer ${accessToken}` },
    payload: {
      productId,
      quantity: 30
    }
  });
  assert.equal(inventoryRes.statusCode, 200);
});

test("create order with idempotency and request payment", async () => {
  const createOrderRes = await app.inject({
    method: "POST",
    url: "/api/v1/orders",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "idempotency-key": "integration-order-key-001"
    },
    payload: {
      items: [{ productId, quantity: 2 }]
    }
  });
  assert.equal(createOrderRes.statusCode, 201);
  orderId = createOrderRes.json().id as string;
  assert.ok(orderId);

  const retryOrderRes = await app.inject({
    method: "POST",
    url: "/api/v1/orders",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "idempotency-key": "integration-order-key-001"
    },
    payload: {
      items: [{ productId, quantity: 2 }]
    }
  });
  assert.equal(retryOrderRes.statusCode, 201);

  const paymentRes = await app.inject({
    method: "POST",
    url: "/api/v1/payments",
    headers: { authorization: `Bearer ${accessToken}` },
    payload: { orderId }
  });
  assert.equal(paymentRes.statusCode, 202);
});
