import { Worker } from "bullmq";
import { redis } from "../core/cache/redis";
import { logger } from "../core/logger/logger";

new Worker(
  "email",
  async (job) => {
    // EN: Production worker placeholder for external email provider integration.
    // VI: Worker production cho viec tich hop nha cung cap email ben ngoai.
    logger.info({ jobId: job.id, data: job.data }, "Processed email job");
  },
  { connection: redis }
);

logger.info("Email worker started");
