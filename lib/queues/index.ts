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

const POST_PUBLISHER_JOB_NAME = "publish-post";

export function getPostPublisherJobId(postId: string) {
  return `post-publisher:${postId}`;
}

export async function removePostPublisherJob(postId: string) {
  const job = await postPublisherQueue.getJob(getPostPublisherJobId(postId));

  if (!job) {
    return;
  }

  const state = await job.getState();
  if (state === "active") {
    return;
  }

  await job.remove();
}

export async function schedulePostPublisherJob(
  postId: string,
  userId: string,
  scheduledAt: Date
) {
  const jobId = getPostPublisherJobId(postId);
  const existingJob = await postPublisherQueue.getJob(jobId);

  if (existingJob) {
    const state = await existingJob.getState();
    if (state === "active") {
      throw new Error("Post is already being published and cannot be rescheduled.");
    }

    await existingJob.remove();
  }

  return postPublisherQueue.add(
    POST_PUBLISHER_JOB_NAME,
    { postId, userId },
    {
      jobId,
      delay: Math.max(scheduledAt.getTime() - Date.now(), 0),
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 60_000,
      },
      removeOnComplete: true,
      removeOnFail: 100,
    }
  );
}
