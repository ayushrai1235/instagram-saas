"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type {
  DatesSetArg,
  EventApi,
  EventClickArg,
  EventContentArg,
  EventDropArg,
  EventInput,
} from "@fullcalendar/core";
import {
  addDays,
  format,
} from "date-fns";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import useSWR from "swr";

import {
  PLATFORM_IDS,
  PLATFORM_META,
  POST_STATUSES,
  type CalendarPost,
  type CalendarPostsResponse,
  type PlatformId,
  type PostStatus,
} from "@/lib/posts/types";
import { cn } from "@/lib/utils";

type CalendarView = "dayGridMonth" | "dayGridWeek";
type PlatformFilter = "all" | PlatformId;
type StatusFilter = "all" | PostStatus;
type ToastState = { type: "success" | "error"; message: string } | null;

const fetcher = async (url: string): Promise<CalendarPostsResponse> => {
  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to load posts.");
  }

  return response.json();
};

const statusLabels: Record<PostStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  failed: "Failed",
};

const statusStyles: Record<PostStatus, string> = {
  draft: "border-white/10 bg-white/5 text-white/60",
  scheduled: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  published: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  failed: "border-red-400/20 bg-red-400/10 text-red-300",
};

function getPrimaryPlatform(post: CalendarPost) {
  return post.platforms[0]?.platform?.toLowerCase() ?? "twitter";
}

function getPlatformMeta(platform: string) {
  const platformId = platform.toLowerCase() as PlatformId;
  return PLATFORM_META[platformId] ?? { label: platform, color: "#818cf8" };
}

function getPostDate(post: CalendarPost) {
  if (post.scheduledAt) {
    return post.scheduledAt;
  }

  if (post.status === "published" || post.status === "failed") {
    return post.updatedAt;
  }

  return post.createdAt;
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatPanelDate(post: CalendarPost) {
  if (post.scheduledAt) {
    return formatDateTime(post.scheduledAt);
  }

  return `${post.status === "draft" ? "Created" : "Updated"} ${formatDateTime(
    getPostDate(post)
  )}`;
}

function truncate(value: string, limit: number) {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit - 1)}...`;
}

function toEvent(post: CalendarPost): EventInput {
  const primaryPlatform = getPrimaryPlatform(post);
  const platform = getPlatformMeta(primaryPlatform);

  return {
    id: post.id,
    title: post.content || "Untitled post",
    start: getPostDate(post),
    allDay: false,
    editable: post.status !== "published",
    backgroundColor: platform.color,
    borderColor: platform.color,
    textColor: "#ffffff",
    extendedProps: { post },
    classNames: ["social-calendar-event"],
  };
}

function getPostFromEvent(event: EventApi) {
  return event.extendedProps.post as CalendarPost;
}

export default function CalendarClient() {
  const calendarRef = useRef<FullCalendar | null>(null);
  const [calendarTitle, setCalendarTitle] = useState("");
  const [currentView, setCurrentView] = useState<CalendarView>("dayGridMonth");
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const postsUrl = range
    ? `/api/posts?from=${range.from}&to=${range.to}`
    : null;
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<CalendarPostsResponse>(postsUrl, fetcher, {
      refreshInterval: 30_000,
      keepPreviousData: true,
    });

  const filteredPosts = useMemo(() => {
    return (data?.posts ?? []).filter((post) => {
      const matchesPlatform =
        platformFilter === "all" ||
        post.platforms.some(
          (platform) =>
            platform.platform.toLowerCase() === platformFilter
        );
      const matchesStatus =
        statusFilter === "all" || post.status === statusFilter;

      return matchesPlatform && matchesStatus;
    });
  }, [data?.posts, platformFilter, statusFilter]);

  const events = useMemo(
    () => filteredPosts.map((post) => toEvent(post)),
    [filteredPosts]
  );

  const selectedPost = useMemo(
    () => data?.posts.find((post) => post.id === selectedPostId) ?? null,
    [data?.posts, selectedPostId]
  );

  const scheduledCount = filteredPosts.filter(
    (post) => post.status === "scheduled"
  ).length;
  const publishedCount = filteredPosts.filter(
    (post) => post.status === "published"
  ).length;

  const showToast = (nextToast: NonNullable<ToastState>) => {
    setToast(nextToast);
    window.setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleDatesSet = (arg: DatesSetArg) => {
    const inclusiveEnd = addDays(arg.end, -1);
    setCalendarTitle(arg.view.title);
    setRange({
      from: format(arg.start, "yyyy-MM-dd"),
      to: format(inclusiveEnd, "yyyy-MM-dd"),
    });
  };

  const handleViewChange = (view: CalendarView) => {
    setCurrentView(view);
    calendarRef.current?.getApi().changeView(view);
  };

  const handleNavigation = (direction: "prev" | "next" | "today") => {
    const api = calendarRef.current?.getApi();

    if (!api) {
      return;
    }

    if (direction === "prev") {
      api.prev();
    } else if (direction === "next") {
      api.next();
    } else {
      api.today();
    }
  };

  const handleEventClick = (arg: EventClickArg) => {
    setSelectedPostId(getPostFromEvent(arg.event).id);
  };

  const handleEventDrop = async (arg: EventDropArg) => {
    const post = getPostFromEvent(arg.event);

    if (post.status === "published" || !arg.event.start) {
      arg.revert();
      return;
    }

    const sourceDate = post.scheduledAt
      ? new Date(post.scheduledAt)
      : new Date(post.createdAt);
    const scheduledAt = new Date(arg.event.start);
    scheduledAt.setHours(
      sourceDate.getHours(),
      sourceDate.getMinutes(),
      sourceDate.getSeconds(),
      sourceDate.getMilliseconds()
    );

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: scheduledAt.toISOString() }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to reschedule post.");
      }

      await mutate();
      showToast({
        type: "success",
        message: `Post rescheduled for ${formatDateTime(
          scheduledAt.toISOString()
        )}.`,
      });
    } catch (dropError) {
      arg.revert();
      showToast({
        type: "error",
        message:
          dropError instanceof Error
            ? dropError.message
            : "Failed to reschedule post.",
      });
    }
  };

  const handlePublishNow = async () => {
    if (!selectedPost) {
      return;
    }

    setPendingAction("publish");
    try {
      const response = await fetch(`/api/posts/${selectedPost.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publishNow: true }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to publish now.");
      }

      await mutate();
      showToast({ type: "success", message: "Post queued to publish now." });
    } catch (publishError) {
      showToast({
        type: "error",
        message:
          publishError instanceof Error
            ? publishError.message
            : "Failed to publish now.",
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedPost) {
      return;
    }

    setPendingAction("delete");
    try {
      const response = await fetch(`/api/posts/${selectedPost.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to delete post.");
      }

      setConfirmDelete(false);
      setSelectedPostId(null);
      await mutate();
      showToast({ type: "success", message: "Post deleted." });
    } catch (deleteError) {
      showToast({
        type: "error",
        message:
          deleteError instanceof Error
            ? deleteError.message
            : "Failed to delete post.",
      });
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            Content Calendar
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/50">
            <span className="rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1">
              {filteredPosts.length} posts
            </span>
            <span className="rounded-lg border border-amber-400/10 bg-amber-400/5 px-2.5 py-1 text-amber-200/80">
              {scheduledCount} scheduled
            </span>
            <span className="rounded-lg border border-emerald-400/10 bg-emerald-400/5 px-2.5 py-1 text-emerald-300/80">
              {publishedCount} published
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleNavigation("today")}
            className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.07] hover:text-white"
          >
            <CalendarDays className="h-4 w-4 text-[#818cf8]" />
            Today
          </button>
          <Link
            href="/compose"
            className="flex h-9 items-center gap-2 rounded-lg bg-[#6366f1] px-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.25)] transition-colors hover:bg-[#5558e6]"
          >
            <Plus className="h-4 w-4" />
            New Post
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-[#111111]">
        <div className="flex flex-col gap-4 border-b border-white/5 p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => handleNavigation("prev")}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/60 transition-colors hover:bg-white/[0.07] hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => handleNavigation("next")}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/60 transition-colors hover:bg-white/[0.07] hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="min-w-[180px] px-2 text-lg font-semibold text-white">
              {calendarTitle || "Calendar"}
            </div>
            {isValidating && (
              <RefreshCw className="h-4 w-4 animate-spin text-white/30" />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-lg border border-white/10 bg-black/20 p-1">
              <button
                type="button"
                onClick={() => handleViewChange("dayGridMonth")}
                className={cn(
                  "h-7 rounded-md px-3 text-xs font-medium transition-colors",
                  currentView === "dayGridMonth"
                    ? "bg-[#6366f1] text-white"
                    : "text-white/50 hover:text-white"
                )}
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => handleViewChange("dayGridWeek")}
                className={cn(
                  "h-7 rounded-md px-3 text-xs font-medium transition-colors",
                  currentView === "dayGridWeek"
                    ? "bg-[#6366f1] text-white"
                    : "text-white/50 hover:text-white"
                )}
              >
                Week
              </button>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5 text-white/50">
              <Filter className="h-4 w-4 text-white/30" />
              <select
                value={platformFilter}
                onChange={(event) =>
                  setPlatformFilter(event.target.value as PlatformFilter)
                }
                className="h-7 bg-transparent text-sm text-white/70 outline-none"
              >
                <option value="all">All platforms</option>
                {PLATFORM_IDS.map((platformId) => (
                  <option key={platformId} value={platformId}>
                    {PLATFORM_META[platformId].label}
                  </option>
                ))}
              </select>
              <div className="h-5 w-px bg-white/10" />
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="h-7 bg-transparent text-sm text-white/70 outline-none"
              >
                <option value="all">All statuses</option>
                {POST_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-4 flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-200">
            <AlertTriangle className="h-4 w-4" />
            {error.message}
          </div>
        )}

        <div className="social-calendar-shell relative p-4">
          {isLoading && (
            <div className="absolute inset-4 z-10 flex items-center justify-center rounded-lg bg-[#111111]/80 backdrop-blur-sm">
              <Loader2 className="h-6 w-6 animate-spin text-[#818cf8]" />
            </div>
          )}
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={false}
            height="auto"
            dayMaxEvents={3}
            editable
            eventDurationEditable={false}
            events={events}
            datesSet={handleDatesSet}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventContent={renderEventContent}
            eventTimeFormat={{
              hour: "numeric",
              minute: "2-digit",
              meridiem: "short",
            }}
          />
        </div>
      </div>

      <PostSidePanel
        post={selectedPost}
        pendingAction={pendingAction}
        onClose={() => {
          setSelectedPostId(null);
          setConfirmDelete(false);
        }}
        onDelete={() => setConfirmDelete(true)}
        onPublishNow={handlePublishNow}
      />

      {confirmDelete && selectedPost && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#151515] p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-300">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">
                  Delete post?
                </h2>
                <p className="mt-1 text-sm leading-6 text-white/50">
                  This removes the post and its scheduled publishing job.
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="h-9 rounded-lg border border-white/10 px-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={pendingAction === "delete"}
                className="flex h-9 items-center gap-2 rounded-lg bg-red-500 px-3 text-sm font-semibold text-white transition-colors hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pendingAction === "delete" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-[80] flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl",
            toast.type === "success"
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
              : "border-red-400/20 bg-red-400/10 text-red-100"
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

function renderEventContent(arg: EventContentArg) {
  const post = getPostFromEvent(arg.event);
  const platform = getPlatformMeta(getPrimaryPlatform(post));

  return (
    <div className="flex min-w-0 items-center gap-1.5 px-1 py-0.5">
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full bg-white"
        style={{ backgroundColor: platform.color }}
      />
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-normal text-white/80">
        {arg.timeText}
      </span>
      <span className="min-w-0 truncate text-xs font-medium text-white">
        {truncate(post.content || platform.label, 42)}
      </span>
    </div>
  );
}

function PostSidePanel({
  post,
  pendingAction,
  onClose,
  onDelete,
  onPublishNow,
}: {
  post: CalendarPost | null;
  pendingAction: string | null;
  onClose: () => void;
  onDelete: () => void;
  onPublishNow: () => void;
}) {
  return (
    <>
      {post && (
        <button
          type="button"
          aria-label="Close panel"
          onClick={onClose}
          className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-[1px]"
        />
      )}
      <aside
        className={cn(
          "fixed right-0 top-0 z-[60] flex h-screen w-full max-w-md flex-col border-l border-white/10 bg-[#101010] shadow-2xl transition-transform duration-300",
          post ? "translate-x-0" : "translate-x-full"
        )}
      >
        {post && (
          <>
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-normal text-white/30">
                  Post Details
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  {statusLabels[post.status]}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-medium",
                      statusStyles[post.status]
                    )}
                  >
                    {statusLabels[post.status]}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-white/40">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatPanelDate(post)}
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-white/80">
                  {post.content}
                </p>
              </div>

              {post.mediaUrls.length > 0 && (
                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-white">
                    Media
                  </h3>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {post.mediaUrls.slice(0, 4).map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]"
                      >
                        <span
                          aria-hidden="true"
                          className="block aspect-video w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${url})` }}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5">
                <h3 className="text-sm font-semibold text-white">
                  Platforms
                </h3>
                <div className="mt-3 space-y-2">
                  {post.platforms.length > 0 ? (
                    post.platforms.map((platform) => {
                      const meta = getPlatformMeta(platform.platform);
                      return (
                        <div
                          key={platform.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: meta.color }}
                            />
                            <span className="truncate text-sm font-medium text-white/80">
                              {meta.label}
                            </span>
                          </div>
                          <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-xs text-white/50">
                            {platform.status}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm text-white/40">
                      No platform selected
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 p-5">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`/compose?postId=${post.id}`}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg border border-white/10 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={onDelete}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg border border-red-400/20 bg-red-400/5 text-sm font-medium text-red-300 transition-colors hover:bg-red-400/10"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
              {post.status === "scheduled" && (
                <button
                  type="button"
                  onClick={onPublishNow}
                  disabled={pendingAction === "publish"}
                  className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#6366f1] text-sm font-semibold text-white transition-colors hover:bg-[#5558e6] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pendingAction === "publish" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Publish Now
                </button>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}
