"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@parthbadgire/ui/components/dropdown-menu";
import { useSession, signOut } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, LogOut, User, Settings } from "lucide-react";
import { useState } from "react";

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  "/academic": { title: "Academic Hub", sub: "Study resources & PYQs" },
  "/confessions": { title: "Confessions", sub: "Anonymous campus board" },
  "/events": { title: "Events", sub: "Upcoming campus events" },
  "/marketplace": { title: "Marketplace", sub: "Buy & sell on campus" },
  "/clubs": { title: "Clubs", sub: "Campus organizations" },
  "/placements": { title: "Placements", sub: "Internships & offers" },
  "/connections": { title: "Connections", sub: "Find your people" },
  "/hostel": { title: "Hostel Ops", sub: "Maintenance & room exchange" },
};

export function Topbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const pageInfo = Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1]
    || { title: "Dashboard", sub: "IIITL Connect CampusOS" };

  const initial = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "ST";

  return (
    <header
      className="relative flex h-14 items-center justify-between px-4 border-b"
      style={{
        background: "rgba(5,5,8,0.85)",
        backdropFilter: "blur(20px)",
        borderColor: "rgba(255,255,255,0.05)",
      }}
    >
      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.2), rgba(6,182,212,0.15), transparent)" }} />

      {/* Left: Page breadcrumb */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-sm font-bold leading-none" style={{ color: "#f4f4f8" }}>{pageInfo.title}</h1>
          <p className="text-[11px] mt-0.5" style={{ color: "#8b8ba7" }}>{pageInfo.sub}</p>
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center">
        <div
          className="relative flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-300"
          style={{
            background: searchFocused ? "rgba(13,13,20,0.9)" : "rgba(13,13,20,0.6)",
            border: searchFocused
              ? "1px solid rgba(124,58,237,0.4)"
              : "1px solid rgba(255,255,255,0.06)",
            boxShadow: searchFocused ? "0 0 0 3px rgba(124,58,237,0.1), 0 0 20px rgba(124,58,237,0.2)" : "none",
            width: searchFocused ? "280px" : "220px",
          }}
        >
          <Search className="h-3.5 w-3.5 shrink-0" style={{ color: "#8b8ba7" }} />
          <input
            type="text"
            placeholder="Search campus..."
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="bg-transparent text-sm outline-none flex-1 min-w-0"
            style={{ color: "#f4f4f8", caretColor: "#a855f7" }}
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0"
            style={{ background: "rgba(255,255,255,0.05)", color: "#4a4a6a" }}>
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200"
          style={{ color: "#8b8ba7" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
            (e.currentTarget as HTMLElement).style.color = "#f4f4f8";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#8b8ba7";
          }}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {/* Notification dot */}
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full"
            style={{ background: "#a855f7", boxShadow: "0 0 6px rgba(168,85,247,0.8)" }} />
        </button>

        {/* User dropdown */}
        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full outline-none" id="user-menu-trigger">
                {/* Avatar with gradient ring */}
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)", padding: "1.5px" }}>
                  <div className="flex h-full w-full items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: "#0d0d14", color: "#f4f4f8" }}>
                    {initial}
                  </div>
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold leading-none" style={{ color: "#f4f4f8" }}>
                    {session.user.name?.split(" ")[0] || "Student"}
                  </div>
                  <div className="text-[10px] mt-0.5" style={{ color: "#8b8ba7" }}>
                    {session.user.email?.replace("@iiitl.ac.in", "") || ""}
                    <span style={{ color: "#4a4a6a" }}>@iiitl</span>
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none">{session.user.name}</p>
                  <p className="text-xs leading-none" style={{ color: "#8b8ba7" }}>{session.user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")} className="flex items-center gap-2 cursor-pointer">
                <User className="h-3.5 w-3.5" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                <Settings className="h-3.5 w-3.5" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="flex items-center gap-2 cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-400/10"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="h-8 w-8 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.06)" }} />
        )}
      </div>
    </header>
  );
}
