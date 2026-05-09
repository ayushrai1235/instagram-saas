"use client";

import { cn } from "@/lib/utils";
import {
  Briefcase,
  Camera,
  Globe,
  Hash,
  type LucideIcon,
} from "lucide-react";

export type Platform = "twitter" | "linkedin" | "instagram" | "facebook";

const PLATFORM_CONFIG: Record<Platform, { icon: LucideIcon; name: string; color: string }> = {
  twitter: { icon: Hash, name: "Twitter", color: "text-blue-400" },
  linkedin: { icon: Briefcase, name: "LinkedIn", color: "text-blue-600" },
  instagram: { icon: Camera, name: "Instagram", color: "text-pink-500" },
  facebook: { icon: Globe, name: "Facebook", color: "text-blue-500" },
};

interface PlatformSelectorProps {
  connectedPlatforms: Platform[];
  selectedPlatforms: Platform[];
  onChange: (platforms: Platform[]) => void;
}

export function PlatformSelector({ connectedPlatforms, selectedPlatforms, onChange }: PlatformSelectorProps) {
  const togglePlatform = (platform: Platform) => {
    if (selectedPlatforms.includes(platform)) {
      onChange(selectedPlatforms.filter(p => p !== platform));
    } else {
      onChange([...selectedPlatforms, platform]);
    }
  };

  if (connectedPlatforms.length === 0) {
    return (
      <div className="text-sm text-gray-400 italic">
        No platforms connected. Please connect platforms in Settings first.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {connectedPlatforms.map((platform) => {
        const isSelected = selectedPlatforms.includes(platform);
        const config = PLATFORM_CONFIG[platform];
        if (!config) return null;
        
        const Icon = config.icon;

        return (
          <button
            key={platform}
            type="button"
            onClick={() => togglePlatform(platform)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border transition-all",
              isSelected 
                ? "bg-white/10 border-white/20" 
                : "bg-transparent border-white/5 hover:border-white/10 text-gray-400"
            )}
          >
            <Icon className={cn("w-4 h-4", isSelected ? config.color : "text-gray-400")} />
            <span className={cn("text-sm font-medium", isSelected ? "text-white" : "")}>
              {config.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
