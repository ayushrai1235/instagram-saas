import { Worker } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const mediaTransformWorker = new Worker(
  "media-transform",
  async (job) => {
    console.log(`Processing media transform job ${job.id}`);
    // TODO: implement video compression / image optimization logic
  },
  { connection }
);
