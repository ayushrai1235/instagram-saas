"use client";

import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  MessageSquare,
  Link2,
  Plus,
  TrendingUp,
  Clock,
  ArrowUpRight,
} from "lucide-react";

// Platform icon mapping
const platformIcons: Record<string, { color: string; label: string }> = {
  instagram: { color: "#E1306C", label: "Instagram" },
  twitter: { color: "#1DA1F2", label: "Twitter/X" },
  linkedin: { color: "#0A66C2", label: "LinkedIn" },
  facebook: { color: "#1877F2", label: "Facebook" },
  youtube: { color: "#FF0000", label: "YouTube" },
  tiktok: { color: "#00f2ea", label: "TikTok" },
  pinterest: { color: "#E60023", label: "Pinterest" },
  threads: { color: "#ffffff", label: "Threads" },
  reddit: { color: "#FF4500", label: "Reddit" },
};

// Stat card component
function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  trend,
  delay,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  trend?: string;
  delay: number;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-white/5 bg-[#131313] p-6 transition-all duration-300 hover:border-[#6366f1]/20 hover:shadow-[0_0_30px_rgba(99,102,241,0.08)] animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/40 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: iconBg }}
        >
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}

interface DashboardClientProps {
  firstName: string;
  greeting: string;
  scheduledCount: number;
  publishedTodayCount: number;
  autoRepliesCount: number;
  connectedPlatforms: { platform: string; platformUsername: string | null }[];
}

export default function DashboardClient({
  firstName,
  greeting,
  scheduledCount,
  publishedTodayCount,
  autoRepliesCount,
  connectedPlatforms,
}: DashboardClientProps) {
  // Mock upcoming posts (in production these come from the DB)
  const upcomingPosts = [
    {
      id: 1,
      platform: "twitter",
      content: "Excited to share our latest AI feature update! 🚀 Thread incoming...",
      scheduledAt: "Today, 2:00 PM",
    },
    {
      id: 2,
      platform: "instagram",
      content: "Behind the scenes of our product photoshoot 📸",
      scheduledAt: "Today, 4:30 PM",
    },
    {
      id: 3,
      platform: "linkedin",
      content: "We're hiring! Looking for a Senior Full-Stack Engineer...",
      scheduledAt: "Tomorrow, 9:00 AM",
    },
    {
      id: 4,
      platform: "facebook",
      content: "Monthly product update: Here's what we shipped in April...",
      scheduledAt: "Tomorrow, 11:00 AM",
    },
    {
      id: 5,
      platform: "twitter",
      content: "Hot take: The best social media strategy is consistency 📊",
      scheduledAt: "May 7, 10:00 AM",
    },
  ];

  const allPlatforms = [
    "instagram",
    "twitter",
    "linkedin",
    "facebook",
    "youtube",
    "tiktok",
    "pinterest",
    "threads",
    "reddit",
  ];

  const connectedSet = new Set(connectedPlatforms.map((p) => p.platform));

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Greeting */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-white/40 mt-1 text-sm">
          Here&apos;s what&apos;s happening with your social accounts
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Scheduled Posts"
          value={scheduledCount}
          icon={CalendarClock}
          iconColor="#60a5fa"
          iconBg="rgba(96,165,250,0.1)"
          trend="+12% this week"
          delay={0}
        />
        <StatCard
          title="Published Today"
          value={publishedTodayCount}
          icon={CheckCircle2}
          iconColor="#34d399"
          iconBg="rgba(52,211,153,0.1)"
          trend="+3 from yesterday"
          delay={100}
        />
        <StatCard
          title="Auto-Replies Sent"
          value={autoRepliesCount}
          icon={MessageSquare}
          iconColor="#a78bfa"
          iconBg="rgba(167,139,250,0.1)"
          trend="+24% engagement"
          delay={200}
        />
        <StatCard
          title="Connected Platforms"
          value={`${connectedPlatforms.length}/9`}
          icon={Link2}
          iconColor="#fb923c"
          iconBg="rgba(251,146,60,0.1)"
          delay={300}
        />
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Scheduled Posts */}
        <div
          className="rounded-xl border border-white/5 bg-[#131313] overflow-hidden animate-fade-in-up"
          style={{ animationDelay: "400ms" }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#818cf8]" />
              Upcoming Scheduled Posts
            </h2>
            <Link
              href="/calendar"
              className="text-xs text-[#818cf8] hover:text-[#a5b4fc] font-medium flex items-center gap-1 transition-colors"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {upcomingPosts.map((post, i) => {
              const platform = platformIcons[post.platform];
              return (
                <div
                  key={post.id}
                  className="group flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors duration-200 animate-fade-in-up"
                  style={{ animationDelay: `${500 + i * 80}ms` }}
                >
                  {/* Platform dot */}
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/5 transition-all duration-300 group-hover:scale-105"
                    style={{
                      backgroundColor: `${platform?.color}15`,
                    }}
                  >
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: platform?.color }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate">{post.content}</p>
                    <p className="text-xs text-white/30 mt-0.5">{platform?.label}</p>
                  </div>

                  {/* Time */}
                  <span className="text-xs text-white/30 shrink-0 whitespace-nowrap">
                    {post.scheduledAt}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Connected Platforms */}
        <div
          className="rounded-xl border border-white/5 bg-[#131313] overflow-hidden animate-fade-in-up"
          style={{ animationDelay: "450ms" }}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Link2 className="h-4 w-4 text-[#818cf8]" />
              Connected Platforms
            </h2>
            <Link
              href="/settings/connections"
              className="text-xs text-[#818cf8] hover:text-[#a5b4fc] font-medium flex items-center gap-1 transition-colors"
            >
              Manage <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {allPlatforms.slice(0, 5).map((platform, i) => {
              const info = platformIcons[platform];
              const isConnected = connectedSet.has(platform);
              const account = connectedPlatforms.find(
                (p) => p.platform === platform
              );

              return (
                <div
                  key={platform}
                  className="group flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors duration-200 animate-fade-in-up"
                  style={{ animationDelay: `${550 + i * 80}ms` }}
                >
                  {/* Platform icon */}
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/5 transition-all duration-300 group-hover:scale-105"
                    style={{ backgroundColor: `${info?.color}15` }}
                  >
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: info?.color }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80">
                      {info?.label}
                    </p>
                    {isConnected && account?.platformUsername && (
                      <p className="text-xs text-white/30">
                        @{account.platformUsername}
                      </p>
                    )}
                  </div>

                  {/* Status badge */}
                  {isConnected ? (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Connected
                    </span>
                  ) : (
                    <Link
                      href={`/api/social/connect/${platform}`}
                      className="rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/20 px-3 py-1.5 text-xs font-medium text-[#818cf8] hover:bg-[#6366f1]/20 transition-colors"
                    >
                      Connect
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating New Post Button */}
      <Link
        href="/compose"
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6366f1] text-white shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 animate-bounce-gentle"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
