"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenSquare,
  Calendar,
  MessageCircle,
  Image,
  BarChart3,
  Link2,
  Settings,
  Sparkles,
  ChevronLeft,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Compose", href: "/compose", icon: PenSquare },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Auto-Reply", href: "/auto-reply", icon: MessageCircle },
  { label: "Media", href: "/media", icon: Image },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Connections", href: "/settings/connections", icon: Link2 },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen flex flex-col border-r border-white/5 bg-[#111111] transition-all duration-300 ease-in-out",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/5 shrink-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#6366f1] to-[#818cf8] shadow-[0_0_20px_rgba(99,102,241,0.3)]">
          <Rocket className="h-4 w-4 text-white" />
        </div>
        <span
          className={cn(
            "font-semibold text-white text-[15px] tracking-tight whitespace-nowrap transition-all duration-300",
            collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          )}
        >
          Social Copilot
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[#6366f1]/10 text-white"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#6366f1] rounded-r-full animate-in-left" />
              )}
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
                  isActive ? "text-[#818cf8]" : "text-white/40 group-hover:text-white/60"
                )}
              />
              <span
                className={cn(
                  "whitespace-nowrap transition-all duration-300",
                  collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA */}
      {!collapsed && (
        <div className="p-3 animate-fade-in">
          <Link
            href="/pricing"
            className="group relative flex items-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-[#6366f1] to-[#818cf8] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] hover:scale-[1.02]"
          >
            <Sparkles className="h-4 w-4 shrink-0 animate-pulse-slow" />
            <span>Upgrade to Premium</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </Link>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-12 border-t border-white/5 text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-200"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft
          className={cn(
            "h-4 w-4 transition-transform duration-300",
            collapsed && "rotate-180"
          )}
        />
      </button>
    </aside>
  );
}
