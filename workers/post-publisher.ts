import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { db } from "@/lib/db";
import { posts, postPlatforms, socialAccounts } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { platformPublishers } from "@/lib/platforms";

// Note: Ensure REDIS_URL is available to the worker environment
const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const postPublisherWorker = new Worker(
  "post-publisher",
  async (job: Job) => {
    const { postId, userId } = job.data;
    console.log(`Processing post publishing job ${job.id} for post ${postId}`);

    try {
      // 1. Fetch the post
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, postId),
      });

      if (!post) {
        throw new Error(`Post ${postId} not found`);
      }

      if (post.status === "published") {
        console.log(`Post ${postId} is already published`);
        return;
      }

      // Update post status to publishing
      await db.update(posts)
        .set({ status: "publishing" })
        .where(eq(posts.id, postId));

      // 2. Fetch the target platforms
      const platformsToPublish = await db.query.postPlatforms.findMany({
        where: and(
          eq(postPlatforms.postId, postId),
          eq(postPlatforms.status, "pending")
        ),
      });

      if (platformsToPublish.length === 0) {
        console.log(`No pending platforms found for post ${postId}`);
        return;
      }

      // 3. Fetch connected accounts
      const targetPlatformNames = platformsToPublish.map(p => p.platform);
      const accounts = await db.query.socialAccounts.findMany({
        where: and(
          eq(socialAccounts.userId, userId),
          inArray(socialAccounts.platform, targetPlatformNames)
        ),
      });

      // 4. Publish to each platform
      const publishPromises = platformsToPublish.map(async (platformRecord) => {
        const platformName = platformRecord.platform;
        const account = accounts.find(a => a.platform === platformName);
        const publisher = platformPublishers[platformName];

        if (!account || !publisher) {
          await db.update(postPlatforms)
            .set({ status: "failed" })
            .where(eq(postPlatforms.id, platformRecord.id));
          return { platform: platformName, success: false };
        }

        try {
          await db.update(postPlatforms)
            .set({ status: "publishing" })
            .where(eq(postPlatforms.id, platformRecord.id));

          const result = await publisher({
            content: post.content,
            mediaUrls: post.mediaUrls as string[] || [],
            accessToken: account.accessToken,
            refreshToken: account.refreshToken || undefined,
            platformUserId: account.platformUserId || undefined,
          });

          await db.update(postPlatforms)
            .set({ status: "published", platformPostId: result.platformPostId })
            .where(eq(postPlatforms.id, platformRecord.id));
            
          return { platform: platformName, success: true };
        } catch (error) {
          console.error(`Error publishing to ${platformName}:`, error);
          await db.update(postPlatforms)
            .set({ status: "failed" })
            .where(eq(postPlatforms.id, platformRecord.id));
          return { platform: platformName, success: false };
        }
      });

      const results = await Promise.all(publishPromises);
      const allFailed = results.every(r => !r.success);
      const someFailed = results.some(r => !r.success);
      
      let finalStatus = "published";
      if (allFailed) finalStatus = "failed";
      else if (someFailed) finalStatus = "partially_published";

      await db.update(posts)
        .set({ status: finalStatus })
        .where(eq(posts.id, postId));

      console.log(`Job ${job.id} complete. Final status: ${finalStatus}`);

    } catch (error) {
      console.error(`Failed to process job ${job.id}:`, error);
      throw error; // Let BullMQ handle retries
    }
  },
  { connection }
);

postPublisherWorker.on("completed", (job) => {
  console.log(`Job ${job.id} has completed!`);
});

postPublisherWorker.on("failed", (job, err) => {
  console.log(`Job ${job?.id} has failed with ${err.message}`);
});
