import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getCurrentDbUser } from "@/lib/auth/current-db-user";
import { db } from "@/lib/db";
import { commentEvents, postPlatforms, posts } from "@/lib/db/schema";
import {
  POST_STATUSES,
  type CalendarPost,
  type PostStatus,
} from "@/lib/posts/types";
import {
  removePostPublisherJob,
  schedulePostPublisherJob,
} from "@/lib/queues";

export const runtime = "nodejs";

const paramsSchema = z.object({
  postId: z.string().uuid(),
});

const updatePostSchema = z
  .object({
    content: z.string().max(10_000).optional(),
    mediaUrls: z.array(z.string().min(1)).optional(),
    platforms: z.array(z.string().min(1)).optional(),
    scheduledAt: z.string().datetime({ offset: true }).nullable().optional(),
    publishNow: z.boolean().optional(),
    status: z.enum(["draft", "scheduled"]).optional(),
  })
  .refine((value) => Object.values(value).some((item) => item !== undefined), {
    message: "Provide at least one field to update.",
  });

function normalizeMediaUrls(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

async function getOwnedPost(postId: string) {
  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    return { dbUser: null, post: null };
  }

  const post = await db.query.posts.findFirst({
    where: and(eq(posts.id, postId), eq(posts.userId, dbUser.id)),
  });

  return { dbUser, post };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  const rawParams = await context.params;
  const parsedParams = paramsSchema.safeParse(rawParams);

  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }

  const { dbUser, post } = await getOwnedPost(parsedParams.data.postId);

  if (!dbUser || !post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const platforms = await db
    .select({
      id: postPlatforms.id,
      platform: postPlatforms.platform,
      platformPostId: postPlatforms.platformPostId,
      status: postPlatforms.status,
    })
    .from(postPlatforms)
    .where(eq(postPlatforms.postId, post.id));

  const response: CalendarPost = {
    id: post.id,
    content: post.content,
    mediaUrls: normalizeMediaUrls(post.mediaUrls),
    status: POST_STATUSES.includes(post.status as PostStatus)
      ? (post.status as PostStatus)
      : "draft",
    scheduledAt: post.scheduledAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    platforms,
  };

  return NextResponse.json({ post: response });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  const rawParams = await context.params;
  const parsedParams = paramsSchema.safeParse(rawParams);

  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsedBody = updatePostSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues[0]?.message ?? "Invalid request body." },
      { status: 400 }
    );
  }

  const { dbUser, post } = await getOwnedPost(parsedParams.data.postId);

  if (!dbUser || !post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  if (parsedBody.data.publishNow && post.status !== "scheduled") {
    return NextResponse.json(
      { error: "Only scheduled posts can be published immediately." },
      { status: 400 }
    );
  }

  if (
    !parsedBody.data.publishNow &&
    post.status === "published" &&
    (parsedBody.data.scheduledAt !== undefined ||
      parsedBody.data.status === "scheduled")
  ) {
    return NextResponse.json(
      { error: "Published posts cannot be rescheduled." },
      { status: 400 }
    );
  }

  let scheduledAt = post.scheduledAt;
  let status = post.status;

  if (parsedBody.data.publishNow) {
    scheduledAt = new Date();
    status = "scheduled";
  } else if (parsedBody.data.scheduledAt !== undefined) {
    scheduledAt = parsedBody.data.scheduledAt
      ? new Date(parsedBody.data.scheduledAt)
      : null;
    status = parsedBody.data.status ?? (scheduledAt ? "scheduled" : "draft");
  } else if (parsedBody.data.status) {
    status = parsedBody.data.status;
    if (status === "draft") {
      scheduledAt = null;
    } else if (!scheduledAt) {
      scheduledAt = new Date();
    }
  }

  const now = new Date();

  try {
    await db
      .update(posts)
      .set({
        ...(parsedBody.data.content !== undefined
          ? { content: parsedBody.data.content.trim() }
          : {}),
        ...(parsedBody.data.mediaUrls !== undefined
          ? { mediaUrls: parsedBody.data.mediaUrls }
          : {}),
        scheduledAt,
        status,
        updatedAt: now,
      })
      .where(eq(posts.id, post.id));

    if (parsedBody.data.platforms) {
      await db.delete(postPlatforms).where(eq(postPlatforms.postId, post.id));
      await db.insert(postPlatforms).values(
        parsedBody.data.platforms.map((platform) => ({
          postId: post.id,
          platform: platform.toLowerCase(),
          status: "pending",
        }))
      );
    } else if (status === "scheduled") {
      await db
        .update(postPlatforms)
        .set({
          status: "pending",
          updatedAt: now,
        })
        .where(eq(postPlatforms.postId, post.id));
    }

    if (status === "scheduled" && scheduledAt) {
      await schedulePostPublisherJob(post.id, dbUser.id, scheduledAt);
    } else {
      await removePostPublisherJob(post.id);
    }

    return NextResponse.json({
      postId: post.id,
      scheduledAt: scheduledAt?.toISOString() ?? null,
      publishNow: Boolean(parsedBody.data.publishNow),
    });
  } catch (error) {
    console.error("Failed to update post schedule:", error);
    return NextResponse.json(
      { error: "Failed to update the publishing schedule." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  const rawParams = await context.params;
  const parsedParams = paramsSchema.safeParse(rawParams);

  if (!parsedParams.success) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }

  const { post } = await getOwnedPost(parsedParams.data.postId);

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  try {
    await removePostPublisherJob(post.id).catch((error) => {
      console.error("Failed to remove post publishing job:", error);
    });
    await db.delete(commentEvents).where(eq(commentEvents.postId, post.id));
    await db.delete(postPlatforms).where(eq(postPlatforms.postId, post.id));
    await db.delete(posts).where(eq(posts.id, post.id));

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Failed to delete post:", error);
    return NextResponse.json(
      { error: "Failed to delete post." },
      { status: 500 }
    );
  }
}
