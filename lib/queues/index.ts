import { Queue } from "bullmq";
import IORedis from "ioredis";
import { env } from "@/lib/env";

const connection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const postPublisherQueue = new Queue("post-publisher", { connection });
export const commentPollerQueue = new Queue("comment-poller", { connection });
export const autoReplyQueue = new Queue("auto-reply", { connection });
export const tokenRefreshQueue = new Queue("token-refresh", { connection });
export const mediaTransformQueue = new Queue("media-transform", { connection });
