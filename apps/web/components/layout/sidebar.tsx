"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen, Ghost, ShoppingBag, Calendar,
  Building2, Briefcase, Zap, Home,
  Users, User, ChevronRight
} from "lucide-react";
import { cn } from "@parthbadgire/ui/lib/utils";
import { useState } from "react";

const navigation = [
  { name: "Academic Hub", href: "/academic", icon: BookOpen, accent: "#7c3aed", tag: null },
  { name: "Confessions", href: "/confessions", icon: Ghost, accent: "#ec4899", tag: "anon" },
  { name: "Events", href: "/events", icon: Calendar, accent: "#06b6d4", tag: null },
  { name: "Marketplace", href: "/marketplace", icon: ShoppingBag, accent: "#10b981", tag: null },
  { name: "Clubs", href: "/clubs", icon: Building2, accent: "#f59e0b", tag: null },
  { name: "Placements", href: "/placements", icon: Briefcase, accent: "#a855f7", tag: "new" },
  { name: "Connections", href: "/connections", icon: Users, accent: "#22d3ee", tag: "beta" },
  { name: "Profile", href: "/profile", icon: User, accent: "#ec4899", tag: null },
  { name: "Hostel Ops", href: "/hostel", icon: Home, accent: "#f97316", tag: null },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "relative flex h-full flex-col border-r transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
      style={{
        background: "rgba(5, 5, 8, 0.95)",
        backdropFilter: "blur(20px)",
        borderColor: "rgba(255,255,255,0.05)",
      }}
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.5), rgba(6,182,212,0.3), transparent)" }} />

      {/* Logo area */}
      <div className="flex h-14 items-center justify-between px-3 border-b"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className={cn("flex items-center gap-2.5 overflow-hidden transition-all duration-300", collapsed && "opacity-0 w-0")}>
          {/* Animated hex logo */}
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
            <svg viewBox="0 0 40 40" className="h-8 w-8 animate-spin-slow">
              <polygon points="20,2 37,11 37,29 20,38 3,29 3,11" fill="none" stroke="url(#sidebarHex)" strokeWidth="1.5" />
              <defs>
                <linearGradient id="sidebarHex" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute text-[9px] font-black" style={{ background: "linear-gradient(135deg, #a855f7, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>II</span>
          </div>
          <div>
            <div className="text-sm font-bold leading-none tracking-tight" style={{ color: "#f4f4f8" }}>IIITL</div>
            <div className="text-[10px] font-medium tracking-widest uppercase" style={{ color: "#8b8ba7" }}>Connect</div>
          </div>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-6 w-6 items-center justify-center rounded-md transition-colors"
          style={{ color: "#8b8ba7" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#f4f4f8")}
          onMouseLeave={e => (e.currentTarget.style.color = "#8b8ba7")}
          aria-label="Toggle sidebar"
        >
          <ChevronRight className={cn("h-3.5 w-3.5 transition-transform duration-300", !collapsed && "rotate-180")} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-all duration-200",
                collapsed && "justify-center px-2",
              )}
              style={{
                background: isActive ? `${item.accent}18` : "transparent",
                color: isActive ? item.accent : "#8b8ba7",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = `${item.accent}0d`;
                  (e.currentTarget as HTMLElement).style.color = "#f4f4f8";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#8b8ba7";
                }
              }}
            >
              {/* Active left bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ background: item.accent, boxShadow: `0 0 8px ${item.accent}` }} />
              )}

              <item.icon className="h-4 w-4 shrink-0" style={{ color: isActive ? item.accent : undefined }} />

              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.tag && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                      style={{
                        background: `${item.accent}20`,
                        color: item.accent,
                        border: `1px solid ${item.accent}40`
                      }}>
                      {item.tag}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      {!collapsed && (
        <div className="px-3 pb-4 pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <div className="rounded-lg p-3 space-y-1"
            style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}>
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5" style={{ color: "#a855f7" }} />
              <span className="text-xs font-semibold" style={{ color: "#a855f7" }}>CampusOS v1.0</span>
            </div>
            <p className="text-[10px]" style={{ color: "#8b8ba7" }}>
              Built for IIIT Lucknow
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
