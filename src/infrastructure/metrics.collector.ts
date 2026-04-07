import { eventLoopLagGauge, dbPoolGauge } from "./metrics";
import { monitorEventLoopDelay } from "perf_hooks";
import { pgPool } from "../core/database/postgres";

const histogram = monitorEventLoopDelay();
histogram.enable();

export function startMetricsCollector() {
  setInterval(() => {

    // Event loop lag
    eventLoopLagGauge.set(histogram.mean / 1e6);

    // DB pool
    dbPoolGauge.set({ type: "total" }, pgPool.totalCount);
    dbPoolGauge.set({ type: "idle" }, pgPool.idleCount);
    dbPoolGauge.set({ type: "waiting" }, pgPool.waitingCount);

  }, 5000);
}