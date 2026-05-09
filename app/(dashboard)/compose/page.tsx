import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { users, socialAccounts, posts, postPlatforms } from "@/lib/db/schema";
import ComposeClient from "./ComposeClient";
import { Platform } from "@/components/composer/PlatformSelector";
import {
  POST_STATUSES,
  type CalendarPost,
  type PostStatus,
} from "@/lib/posts/types";

export const metadata = {
  title: "Compose Post | Social Copilot",
};

function normalizeMediaUrls(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export default async function ComposePage({
  searchParams,
}: {
  searchParams: Promise<{ postId?: string }>;
}) {
  const { userId: clerkUserId } = await auth();
  const { postId } = await searchParams;
  
  if (!clerkUserId) {
    return <div>Unauthorized</div>;
  }

  // Fetch internal user
  const userResult = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUserId),
  });

  if (!userResult) {
    return <div>User not found</div>;
  }

  // Fetch connected accounts
  const accounts = await db.query.socialAccounts.findMany({
    where: eq(socialAccounts.userId, userResult.id),
  });

  const connectedPlatforms = accounts.map(a => a.platform) as Platform[];
  let initialPost: CalendarPost | null = null;

  if (postId) {
    const post = await db.query.posts.findFirst({
      where: and(eq(posts.id, postId), eq(posts.userId, userResult.id)),
    });

    if (post) {
      const platforms = await db.query.postPlatforms.findMany({
        where: eq(postPlatforms.postId, post.id),
      });

      initialPost = {
        id: post.id,
        content: post.content,
        mediaUrls: normalizeMediaUrls(post.mediaUrls),
        status: POST_STATUSES.includes(post.status as PostStatus)
          ? (post.status as PostStatus)
          : "draft",
        scheduledAt: post.scheduledAt?.toISOString() ?? null,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        platforms: platforms.map((platform) => ({
          id: platform.id,
          platform: platform.platform,
          platformPostId: platform.platformPostId,
          status: platform.status,
        })),
      };
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {initialPost ? "Edit Post" : "Compose Post"}
        </h1>
        <p className="text-gray-400 mt-2">Create and schedule content across your platforms.</p>
      </div>

      <ComposeClient
        connectedPlatforms={connectedPlatforms}
        initialPost={initialPost}
      />
    </div>
  );
}
