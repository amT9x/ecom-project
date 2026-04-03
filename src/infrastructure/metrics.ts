import { Gauge, Histogram, Registry, collectDefaultMetrics } from "prom-client";

export const metricsRegistry = new Registry();
collectDefaultMetrics({ register: metricsRegistry });

export const httpDurationMs = new Histogram({
  name: "http_request_duration_ms",
  help: "HTTP request duration in milliseconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [5, 10, 25, 50, 100, 300, 500, 1000],
  registers: [metricsRegistry]
});

export const eventLoopLagGauge = new Gauge({
  name: "node_event_loop_lag_ms",
  help: "Event loop lag in milliseconds",
  registers: [metricsRegistry]
});

export const dbPoolGauge = new Gauge({
  name: "db_pool_connections",
  help: "Database pool metrics by type",
  labelNames: ["type"],
  registers: [metricsRegistry]
});
