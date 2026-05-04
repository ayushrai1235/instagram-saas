import { Worker } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const tokenRefreshWorker = new Worker(
  "token-refresh",
  async (job) => {
    console.log(`Processing token refresh job ${job.id}`);
    // TODO: implement OAuth token refresh logic
  },
  { connection }
);
