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
import { LogOut, User, Settings, Search, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import Link from "next/link";
import { cn } from "@parthbadgire/ui/lib/utils";

const NAVIGATION = [
  { name: "Academics", href: "/academic", accent: "#E9D5FF" },
  { name: "Chat", href: "/anonymous-chat", accent: "#A7F3D0" },
  { name: "Events", href: "/events", accent: "#BAE6FD" },
  { name: "Market", href: "/marketplace", accent: "#FFDAB9" },
  { name: "Clubs", href: "/clubs", accent: "#E9D5FF" },
  { name: "Connections", href: "/connections", accent: "#BAE6FD" },
  { name: "Axios", href: "/axios", accent: "#E9D5FF" },
  { name: "About Us", href: "/about", accent: "#FBCFE8" },
];

export function Topbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    name: string;
    image: string | null;
    role: string;
    studentProfile: { batch: string } | null;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const initial = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "ST";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      setShowSearchDropdown(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/profile/search?q=${encodeURIComponent(searchQuery)}`, { credentials: "include" });
        if (res.ok) {
          setSearchResults(await res.json());
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <header
      className="relative flex h-[72px] items-center justify-between px-8 md:px-12 border-b sticky top-0 z-50"
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
            <div className="text-2xl font-black tracking-tighter text-white">iiitl<span className="opacity-90">.connect</span></div>
          </div>
        </Link>
      </div>
        
      {/* Center: Horizontal Navigation Links */}
      <div className="hidden lg:flex justify-center flex-1 mx-2">
        <nav className="flex items-center justify-center bg-[#0A0A0A]/50 p-1 rounded-full border border-neutral-800/80 backdrop-blur-md">
          {NAVIGATION.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative px-3 py-1.5 rounded-full text-[11px] xl:text-xs font-semibold transition-all duration-300 whitespace-nowrap",
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
      <div className="flex-1 flex items-center justify-end gap-3 md:gap-4">
        
        {/* Search */}
        <div ref={searchRef} className="relative hidden md:block">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchQuery.trim()) setShowSearchDropdown(true); }}
              className="w-48 lg:w-64 pl-9 pr-4 py-1.5 bg-black/40 border border-neutral-800 rounded-full text-xs text-white focus:outline-none focus:border-pastel-lavender/50 transition-all placeholder:text-neutral-600"
            />
          </div>
          
          {/* Search Dropdown */}
          {showSearchDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0A0A0A]/95 backdrop-blur-xl border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl py-2 z-50 animate-fade-in-up" style={{ minWidth: "100%" }}>
              {isSearching ? (
                <div className="flex items-center justify-center py-4 text-neutral-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="flex flex-col max-h-[300px] overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        setShowSearchDropdown(false);
                        setSearchQuery("");
                        router.push(`/u/${user.id}`);
                      }}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors text-left"
                    >
                      <div className="h-8 w-8 rounded-full overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0 flex items-center justify-center text-xs font-bold text-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {user.image ? <img src={user.image} alt="" className="h-full w-full object-cover" /> : user.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-sm font-semibold text-white truncate">{user.name}</div>
                        <div className="text-[10px] text-neutral-500 truncate">
                          {user.role} {user.studentProfile?.batch ? `· Class of ${user.studentProfile.batch}` : ""}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-neutral-500">
                  No users found
                </div>
              )}
            </div>
          )}
        </div>

        {/* User dropdown */}
        {session?.user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="group flex items-center gap-2.5 rounded-full bg-white/5 border border-white/5 pr-4 pl-1.5 py-1.5 outline-none transition-all hover:bg-white/10 hover:border-white/10 shadow-lg hover:shadow-xl" id="user-menu-trigger">
                {/* Premium User Avatar */}
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-pastel-lavender/90 to-pastel-blue/90 overflow-hidden shadow-inner transition-transform group-hover:scale-105">
                  <div className="relative z-10 text-xs font-black text-black">
                    {initial}
                  </div>
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-[13px] font-bold leading-none text-white tracking-tight">
                    {session.user.name?.split(" ")[0] || "Student"}
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
              <DropdownMenuItem onClick={() => router.push("/settings")} className="flex items-center gap-2 cursor-pointer focus:bg-white/5 focus:text-white transition-colors">
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
