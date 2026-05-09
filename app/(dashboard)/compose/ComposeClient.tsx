"use client";

import { useState } from "react";
import { Platform, PlatformSelector } from "@/components/composer/PlatformSelector";
import { MediaUploader } from "@/components/composer/MediaUploader";
import { AICaptionModal } from "@/components/composer/AICaptionModal";
import { Sparkles, Calendar, Send, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { CalendarPost } from "@/lib/posts/types";

interface ComposeClientProps {
  connectedPlatforms: Platform[];
  initialPost?: CalendarPost | null;
}

function isComposePlatform(platform: string): platform is Platform {
  return ["twitter", "linkedin", "instagram", "facebook"].includes(platform);
}

function toDateTimeLocal(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export default function ComposeClient({ connectedPlatforms, initialPost }: ComposeClientProps) {
  const router = useRouter();
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(() => {
    const initialPlatforms =
      initialPost?.platforms
        .map((platform) => platform.platform)
        .filter(isComposePlatform)
        .filter((platform) => connectedPlatforms.includes(platform)) ?? [];

    return initialPlatforms.length > 0
      ? initialPlatforms
      : connectedPlatforms.length > 0
        ? [connectedPlatforms[0]]
        : [];
  });
  const [content, setContent] = useState(initialPost?.content ?? "");
  const [mediaUrls, setMediaUrls] = useState<string[]>(initialPost?.mediaUrls ?? []);
  const [scheduledAt, setScheduledAt] = useState(toDateTimeLocal(initialPost?.scheduledAt ?? null));
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAiInsert = (text: string, isAppend: boolean) => {
    if (isAppend) {
      setContent(prev => prev + text);
    } else {
      setContent(text);
    }
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (selectedPlatforms.length === 0) {
      alert("Please select at least one platform");
      return;
    }
    if (!content.trim() && mediaUrls.length === 0) {
      alert("Please add some content or media");
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = initialPost ? `/api/posts/${initialPost.id}` : "/api/posts";
      const res = await fetch(endpoint, {
        method: initialPost ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          mediaUrls,
          platforms: selectedPlatforms,
          scheduledAt: isDraft || !scheduledAt ? null : new Date(scheduledAt).toISOString(),
          status: isDraft ? "draft" : "scheduled",
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create post");
      }

      alert(initialPost ? "Post successfully updated!" : "Post successfully created!");
      // Reset form or navigate away
      setContent("");
      setMediaUrls([]);
      setScheduledAt("");
      router.push("/calendar");
      
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Composer Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Platforms */}
        <div className="bg-[#111] rounded-2xl border border-white/5 p-6">
          <h2 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Select Platforms</h2>
          <PlatformSelector 
            connectedPlatforms={connectedPlatforms}
            selectedPlatforms={selectedPlatforms}
            onChange={setSelectedPlatforms}
          />
        </div>

        {/* Editor */}
        <div className="bg-[#111] rounded-2xl border border-white/5 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Post Content</h2>
            <button 
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-full"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Magic
            </button>
          </div>
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What do you want to share today?"
            className="w-full bg-transparent border-0 text-white placeholder-gray-600 resize-none h-48 focus:ring-0 text-lg leading-relaxed"
          />
          
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
            <div className="text-xs text-gray-500">
              {content.length} characters
            </div>
            {/* Optional: Add emoji picker toggle here */}
          </div>
        </div>

        {/* Media */}
        <div className="bg-[#111] rounded-2xl border border-white/5 p-6">
          <h2 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Media</h2>
          <MediaUploader mediaUrls={mediaUrls} onChange={setMediaUrls} />
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="space-y-6">
        <div className="bg-[#111] rounded-2xl border border-white/5 p-6 sticky top-8">
          <h2 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Schedule & Publish</h2>
          
          <div className="space-y-4 mb-8">
            <label className="block">
              <span className="text-sm text-gray-300 block mb-2">Publish Date & Time (Optional)</span>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="datetime-local" 
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </label>
            {scheduledAt && (
              <p className="text-xs text-indigo-400">
                Post will be scheduled for future publishing.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all",
                scheduledAt 
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20" 
                  : "bg-white text-black hover:bg-gray-200"
              )}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : scheduledAt ? (
                <Calendar className="w-5 h-5" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {scheduledAt ? "Schedule Post" : "Publish Now"}
            </button>
            
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-white bg-white/5 hover:bg-white/10 transition-all border border-white/5"
            >
              <Save className="w-4 h-4" />
              Save as Draft
            </button>
          </div>
        </div>
      </div>

      <AICaptionModal 
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onInsert={handleAiInsert}
        platform={selectedPlatforms[0] || "twitter"}
      />
    </div>
  );
}
