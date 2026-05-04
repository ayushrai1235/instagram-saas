import { Worker } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const autoReplyWorker = new Worker(
  "auto-reply",
  async (job) => {
    console.log(`Processing auto reply job ${job.id}`);
    // TODO: implement auto reply generation and dispatch logic
  },
  { connection }
);
