export const POST_STATUSES = ["draft", "scheduled", "published", "failed"] as const;

export type PostStatus = (typeof POST_STATUSES)[number];

export const PLATFORM_META = {
  instagram: { label: "Instagram", color: "#a855f7" },
  linkedin: { label: "LinkedIn", color: "#0a66c2" },
  twitter: { label: "Twitter", color: "#06b6d4" },
  tiktok: { label: "TikTok", color: "#ef4444" },
  youtube: { label: "YouTube", color: "#ff0000" },
  facebook: { label: "Facebook", color: "#1877f2" },
  discord: { label: "Discord", color: "#5865f2" },
  slack: { label: "Slack", color: "#2eb67d" },
  pinterest: { label: "Pinterest", color: "#e60023" },
  threads: { label: "Threads", color: "#ffffff" },
  reddit: { label: "Reddit", color: "#ff4500" },
} as const;

export type PlatformId = keyof typeof PLATFORM_META;

export const PLATFORM_IDS = Object.keys(PLATFORM_META) as PlatformId[];

export type CalendarPostPlatform = {
  id: string;
  platform: string;
  platformPostId: string | null;
  status: string;
};

export type CalendarPost = {
  id: string;
  content: string;
  mediaUrls: string[];
  status: PostStatus;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  platforms: CalendarPostPlatform[];
};

export type CalendarPostsResponse = {
  posts: CalendarPost[];
};
