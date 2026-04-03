import { Queue } from "bullmq";
import { redis } from "../cache/redis";

export const emailQueue = new Queue("email", {
  connection: redis
});
