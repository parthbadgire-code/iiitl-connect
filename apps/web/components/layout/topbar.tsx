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
import { Bell, LogOut, User, Settings } from "lucide-react";

import Link from "next/link";
import { cn } from "@parthbadgire/ui/lib/utils";

const NAVIGATION = [
  { name: "Academic Hub", href: "/academic", accent: "#E9D5FF" },
  { name: "Anonymous Chat", href: "/anonymous-chat", accent: "#A7F3D0" },
  { name: "Events", href: "/events", accent: "#BAE6FD" },
  { name: "Marketplace", href: "/marketplace", accent: "#FFDAB9" },
  { name: "Lost & Found", href: "/lost-found", accent: "#FCD34D" },
  { name: "Clubs", href: "/clubs", accent: "#E9D5FF" },
  { name: "Connections", href: "/connections", accent: "#BAE6FD" },
  { name: "About Us", href: "/about", accent: "#FBCFE8" },
];

export function Topbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const initial = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "ST";

  return (
    <header
      className="relative flex h-14 items-center justify-between px-4 border-b sticky top-0 z-50"
      style={{
        background: "rgba(5,5,5,0.8)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        borderColor: "rgba(255,255,255,0.05)",
      }}
    >
      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(233,213,255,0.2), rgba(186,230,253,0.15), transparent)" }} />

      {/* Left: Logo */}
      <div className="flex-1 flex items-center justify-start">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex h-8 w-8 items-center justify-center group-hover:scale-110 transition-transform">
            <svg viewBox="0 0 40 40" className="h-8 w-8 animate-[spin_4s_linear_infinite]">
              <polygon points="20,2 37,11 37,29 20,38 3,29 3,11" fill="none" stroke="url(#navHex)" strokeWidth="1.5" />
              <defs>
                <linearGradient id="navHex" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E9D5FF" />
                  <stop offset="100%" stopColor="#BAE6FD" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 rounded-full bg-pastel-lavender/20 blur-md scale-150 animate-pulse" />
            <span className="absolute text-[9px] font-black text-white" style={{ textShadow: "0 0 10px rgba(233,213,255,0.8)" }}>II</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-extrabold leading-none text-white tracking-tight">IIITL Connect</div>
          </div>
        </Link>
      </div>
        
      {/* Center: Horizontal Navigation Links */}
      <div className="hidden lg:flex justify-center">
        <nav className="flex items-center gap-1 bg-[#0A0A0A]/50 p-1 rounded-full border border-neutral-800/80 backdrop-blur-md">
          {NAVIGATION.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-300",
                  isActive ? "text-white" : "text-neutral-500 hover:text-white"
                )}
                style={{
                  textShadow: isActive ? `0 0 15px ${item.accent}` : "none",
                }}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pastel-lavender/10 to-pastel-blue/10 animate-pulse border"
                    style={{ borderColor: `${item.accent}40`, boxShadow: `inset 0 0 10px ${item.accent}20` }} />
                )}
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
          </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex-1 flex items-center justify-end gap-2">
        {/* Notification bell */}
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 group"
          style={{ color: "#737373" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
            (e.currentTarget as HTMLElement).style.color = "#fff";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#737373";
          }}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 group-hover:scale-110 transition-transform" />
          {/* Notification dot with pulse */}
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-pastel-mint animate-pulse"
            style={{ boxShadow: "0 0 10px #A7F3D0" }} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-pastel-mint animate-ping" />
        </button>

        {/* User dropdown */}
        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex items-center gap-3 rounded-full outline-none transition-all" id="user-menu-trigger">
                {/* Avatar with crazy rotating gradient ring */}
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full overflow-hidden"
                  style={{ padding: "2px" }}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-pastel-lavender via-pastel-blue to-pastel-mint animate-[spin_3s_linear_infinite]" />
                  <div className="relative flex h-full w-full items-center justify-center rounded-full text-xs font-bold z-10 transition-transform group-hover:scale-95"
                    style={{ background: "#050505", color: "#fff" }}>
                    {initial}
                  </div>
                </div>
                <div className="hidden sm:block text-left group-hover:opacity-80 transition-opacity">
                  <div className="text-xs font-extrabold leading-none text-white tracking-tight">
                    {session.user.name?.split(" ")[0] || "Student"}
                  </div>
                  <div className="text-[10px] mt-0.5 text-neutral-500 font-mono tracking-tighter">
                    {session.user.email?.replace("@iiitl.ac.in", "") || ""}
                    <span className="text-pastel-lavender">@iiitl</span>
                  </div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#0A0A0A]/90 backdrop-blur-3xl border border-neutral-800 text-white shadow-[0_0_40px_rgba(233,213,255,0.05)]">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none text-white">{session.user.name}</p>
                  <p className="text-xs leading-none text-neutral-500">{session.user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-800/50" />
              <DropdownMenuItem onClick={() => router.push("/profile")} className="flex items-center gap-2 cursor-pointer focus:bg-white/5 focus:text-white transition-colors">
                <User className="h-3.5 w-3.5 text-pastel-lavender" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-white/5 focus:text-white transition-colors">
                <Settings className="h-3.5 w-3.5 text-pastel-blue" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-800/50" />
              <DropdownMenuItem
                onClick={async () => {
                  await signOut();
                  router.push("/login");
                }}
                className="flex items-center gap-2 cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-400/10 transition-colors"
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
