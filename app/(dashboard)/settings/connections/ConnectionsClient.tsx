"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Camera,
  Hash,
  Briefcase,
  Globe,
  Play,
  Music2,
  Pin,
  AtSign,
  MessageCircle,
  ExternalLink,
  Check,
  X,
  Loader2,
} from "lucide-react";

const platforms = [
  {
    id: "instagram",
    name: "Instagram",
    icon: Camera,
    color: "#E1306C",
    gradient: "from-[#833AB4] via-[#E1306C] to-[#F77737]",
    description: "Share photos, stories, and reels",
  },
  {
    id: "twitter",
    name: "Twitter / X",
    icon: Hash,
    color: "#1DA1F2",
    gradient: "from-[#1DA1F2] to-[#0d8ecf]",
    description: "Post tweets and threads",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: Briefcase,
    color: "#0A66C2",
    gradient: "from-[#0A66C2] to-[#004182]",
    description: "Professional posts and articles",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: Globe,
    color: "#1877F2",
    gradient: "from-[#1877F2] to-[#0d65d9]",
    description: "Pages, groups, and stories",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: Play,
    color: "#FF0000",
    gradient: "from-[#FF0000] to-[#cc0000]",
    description: "Videos and community posts",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: Music2,
    color: "#00f2ea",
    gradient: "from-[#00f2ea] to-[#ff0050]",
    description: "Short-form video content",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    icon: Pin,
    color: "#E60023",
    gradient: "from-[#E60023] to-[#bd001d]",
    description: "Pins and boards",
  },
  {
    id: "threads",
    name: "Threads",
    icon: AtSign,
    color: "#ffffff",
    gradient: "from-[#ffffff] to-[#cccccc]",
    description: "Text-based conversations",
  },
  {
    id: "reddit",
    name: "Reddit",
    icon: MessageCircle,
    color: "#FF4500",
    gradient: "from-[#FF4500] to-[#cc3700]",
    description: "Posts and community engagement",
  },
];

interface ConnectionsClientProps {
  connectedPlatforms: {
    id: string;
    platform: string;
    platformUsername: string | null;
  }[];
}

export default function ConnectionsClient({
  connectedPlatforms,
}: ConnectionsClientProps) {
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const connectedMap = new Map(
    connectedPlatforms.map((p) => [p.platform, p])
  );

  const handleDisconnect = async (platformId: string) => {
    setDisconnecting(platformId);
    // Simulated — in production this calls a real API
    await new Promise((r) => setTimeout(r, 1500));
    setDisconnecting(null);
    // TODO: Call actual disconnect API and refresh page
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Platform Connections
        </h1>
        <p className="text-white/40 mt-1 text-sm">
          Connect your social media accounts to start publishing and managing
          content
        </p>
      </div>

      {/* Stats bar */}
      <div
        className="flex items-center gap-6 rounded-xl border border-white/5 bg-[#131313] px-6 py-4 animate-fade-in-up"
        style={{ animationDelay: "100ms" }}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-white/60">
            <span className="font-semibold text-white">
              {connectedPlatforms.length}
            </span>{" "}
            connected
          </span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-white/20" />
          <span className="text-sm text-white/60">
            <span className="font-semibold text-white">
              {9 - connectedPlatforms.length}
            </span>{" "}
            available
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex-1 hidden sm:block">
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6366f1] to-[#818cf8] transition-all duration-700"
              style={{
                width: `${(connectedPlatforms.length / 9) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Platform Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform, i) => {
          const connected = connectedMap.get(platform.id);
          const isConnected = !!connected;
          const isDisconnecting = disconnecting === platform.id;

          return (
            <div
              key={platform.id}
              className={`group relative overflow-hidden rounded-xl border bg-[#131313] p-6 transition-all duration-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.08)] animate-fade-in-up ${
                isConnected
                  ? "border-emerald-500/20 hover:border-emerald-500/30"
                  : "border-white/5 hover:border-[#6366f1]/20"
              }`}
              style={{ animationDelay: `${200 + i * 80}ms` }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Connected indicator bar */}
              {isConnected && (
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-400" />
              )}

              <div className="relative z-10">
                {/* Platform header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/5 transition-all duration-300 group-hover:scale-110 group-hover:border-white/10"
                      style={{
                        backgroundColor: `${platform.color}10`,
                      }}
                    >
                      <platform.icon
                        className="h-6 w-6 transition-colors duration-300"
                        style={{ color: platform.color }}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {platform.name}
                      </h3>
                      <p className="text-xs text-white/30">
                        {platform.description}
                      </p>
                    </div>
                  </div>

                  {/* Status dot */}
                  {isConnected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                  )}
                </div>

                {/* Connected info or CTA */}
                {isConnected ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: platform.color }}
                      />
                      <span className="text-sm text-white/60">
                        {connected.platformUsername
                          ? `@${connected.platformUsername}`
                          : "Account connected"}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDisconnect(platform.id)}
                      disabled={isDisconnecting}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200 disabled:opacity-50"
                    >
                      {isDisconnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Disconnecting...
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4" />
                          Disconnect
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <Link
                    href={`/api/social/connect/${platform.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#6366f1] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5558e6] hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all duration-300 group/btn"
                  >
                    <ExternalLink className="h-4 w-4 transition-transform duration-200 group-hover/btn:rotate-12" />
                    Connect {platform.name}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
