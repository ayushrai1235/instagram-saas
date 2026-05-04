"use client";

import { UserButton } from "@clerk/nextjs";
import { Bell, Menu, Search } from "lucide-react";

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl px-6 transition-all duration-300"
    >
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="relative hidden sm:flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-white/30" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-64 rounded-lg bg-white/5 border border-white/5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#6366f1]/50 focus:ring-1 focus:ring-[#6366f1]/20 transition-all duration-200"
          />
          <kbd className="absolute right-3 hidden md:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-white/30">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all duration-200">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
        </button>

        {/* Plan badge */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/20 px-3 py-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-[#6366f1] animate-pulse" />
          <span className="text-xs font-medium text-[#818cf8]">Free Plan</span>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-white/10" />

        {/* User button */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8 ring-2 ring-white/10 ring-offset-2 ring-offset-[#0a0a0a]",
            },
          }}
        />
      </div>
    </header>
  );
}
