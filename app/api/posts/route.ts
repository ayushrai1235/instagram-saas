import { NextRequest, NextResponse } from "next/server";
import {
  and,
  asc,
  eq,
  gte,
  inArray,
  isNotNull,
  isNull,
  lte,
  or,
  type SQL,
} from "drizzle-orm";
import { z } from "zod";

import { getCurrentDbUser } from "@/lib/auth/current-db-user";
import { db } from "@/lib/db";
import { postPlatforms, posts } from "@/lib/db/schema";
import {
  PLATFORM_IDS,
  POST_STATUSES,
  type CalendarPost,
  type CalendarPostsResponse,
  type PlatformId,
  type PostStatus,
} from "@/lib/posts/types";
import { schedulePostPublisherJob } from "@/lib/queues";

export const runtime = "nodejs";

const createPostSchema = z
  .object({
    content: z.string().max(10_000).optional().default(""),
    mediaUrls: z.array(z.string().min(1)).optional().default([]),
    platforms: z.array(z.string().min(1)).min(1),
    scheduledAt: z.string().nullable().optional(),
    status: z.enum(["draft", "scheduled"]).optional(),
  })
  .refine((value) => value.content.trim().length > 0 || value.mediaUrls.length > 0, {
    message: "Add content or media before saving a post.",
  });

function parseDateParam(value: string | null, endOfDay = false) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const time = endOfDay ? "23:59:59.999" : "00:00:00.000";
  const date = new Date(`${value}T${time}`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function parseListParam<T extends string>(
  searchParams: URLSearchParams,
  key: string,
  allowedValues: readonly T[]
) {
  const allowed = new Set<string>(allowedValues);

  return searchParams
    .getAll(key)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim().toLowerCase())
    .filter((value): value is T => allowed.has(value));
}

function normalizeMediaUrls(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function parseScheduleInput(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(request: NextRequest) {
  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const from = parseDateParam(searchParams.get("from"));
  const to = parseDateParam(searchParams.get("to"), true);

  if (!from || !to || from > to) {
    return NextResponse.json(
      { error: "Expected valid from and to dates in YYYY-MM-DD format." },
      { status: 400 }
    );
  }

  const selectedStatuses = parseListParam<PostStatus>(
    searchParams,
    "status",
    POST_STATUSES
  );
  const selectedPlatforms = parseListParam<PlatformId>(
    searchParams,
    "platform",
    PLATFORM_IDS
  );

  const filters: SQL[] = [eq(posts.userId, dbUser.id)];
  const visibleRange = or(
    and(isNotNull(posts.scheduledAt), gte(posts.scheduledAt, from), lte(posts.scheduledAt, to)),
    and(isNull(posts.scheduledAt), gte(posts.createdAt, from), lte(posts.createdAt, to)),
    and(isNull(posts.scheduledAt), gte(posts.updatedAt, from), lte(posts.updatedAt, to))
  );

  if (visibleRange) {
    filters.push(visibleRange);
  }

  if (selectedStatuses.length > 0) {
    filters.push(inArray(posts.status, selectedStatuses));
  }

  const postRows = await db
    .select({
      id: posts.id,
      content: posts.content,
      mediaUrls: posts.mediaUrls,
      status: posts.status,
      scheduledAt: posts.scheduledAt,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .where(and(...filters))
    .orderBy(asc(posts.scheduledAt), asc(posts.createdAt));

  const postIds = postRows.map((post) => post.id);
  const platformRows =
    postIds.length > 0
      ? await db
          .select({
            id: postPlatforms.id,
            postId: postPlatforms.postId,
            platform: postPlatforms.platform,
            platformPostId: postPlatforms.platformPostId,
            status: postPlatforms.status,
          })
          .from(postPlatforms)
          .where(inArray(postPlatforms.postId, postIds))
      : [];

  const platformsByPostId = new Map<string, typeof platformRows>();
  for (const platform of platformRows) {
    const platforms = platformsByPostId.get(platform.postId) ?? [];
    platforms.push(platform);
    platformsByPostId.set(platform.postId, platforms);
  }

  const postsForCalendar: CalendarPost[] = postRows
    .map((post) => ({
      id: post.id,
      content: post.content,
      mediaUrls: normalizeMediaUrls(post.mediaUrls),
      status: POST_STATUSES.includes(post.status as PostStatus)
        ? (post.status as PostStatus)
        : "draft",
      scheduledAt: post.scheduledAt?.toISOString() ?? null,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      platforms: (platformsByPostId.get(post.id) ?? []).map((platform) => ({
        id: platform.id,
        platform: platform.platform,
        platformPostId: platform.platformPostId,
        status: platform.status,
      })),
    }))
    .filter((post) => {
      if (selectedPlatforms.length === 0) {
        return true;
      }

      return post.platforms.some((platform) =>
        selectedPlatforms.includes(platform.platform as PlatformId)
      );
    });

  const response: CalendarPostsResponse = { posts: postsForCalendar };
  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsedBody = createPostSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues[0]?.message ?? "Invalid request body." },
      { status: 400 }
    );
  }

  const scheduledAt = parseScheduleInput(parsedBody.data.scheduledAt);

  if (parsedBody.data.scheduledAt && !scheduledAt) {
    return NextResponse.json(
      { error: "Invalid scheduledAt value." },
      { status: 400 }
    );
  }

  const status =
    parsedBody.data.status === "draft" ? "draft" : "scheduled";
  const publishAt = status === "scheduled" ? scheduledAt ?? new Date() : null;

  try {
    const [createdPost] = await db
      .insert(posts)
      .values({
        userId: dbUser.id,
        content: parsedBody.data.content.trim(),
        mediaUrls: parsedBody.data.mediaUrls,
        status,
        scheduledAt: publishAt,
      })
      .returning({
        id: posts.id,
      });

    await db.insert(postPlatforms).values(
      parsedBody.data.platforms.map((platform) => ({
        postId: createdPost.id,
        platform: platform.toLowerCase(),
        status: "pending",
      }))
    );

    if (publishAt) {
      await schedulePostPublisherJob(createdPost.id, dbUser.id, publishAt);
    }

    return NextResponse.json(
      { id: createdPost.id, scheduledAt: publishAt?.toISOString() ?? null },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create post:", error);
    return NextResponse.json(
      { error: "Failed to create post." },
      { status: 500 }
    );
  }
}
