import { Worker } from "bullmq";
import IORedis from "ioredis";

// Note: Ensure REDIS_URL is available to the worker environment
const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const postPublisherWorker = new Worker(
  "post-publisher",
  async (job) => {
    console.log(`Processing post publishing job ${job.id}`);
    // TODO: implement publishing logic
  },
  { connection }
);

postPublisherWorker.on("completed", (job) => {
  console.log(`Job ${job.id} has completed!`);
});

postPublisherWorker.on("failed", (job, err) => {
  console.log(`Job ${job?.id} has failed with ${err.message}`);
});
