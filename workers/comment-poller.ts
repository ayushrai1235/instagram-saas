import { Worker } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const commentPollerWorker = new Worker(
  "comment-poller",
  async (job) => {
    console.log(`Processing comment polling job ${job.id}`);
    // TODO: implement polling logic
  },
  { connection }
);
