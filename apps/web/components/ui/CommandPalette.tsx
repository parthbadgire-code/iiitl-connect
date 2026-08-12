"use client";

import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Search, Compass, ShoppingBag, Users, Calendar, BookOpen, Shield, ChevronRight } from "lucide-react";
import { soundManager } from "@/lib/sound";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => {
          if (!open) soundManager?.playAction();
          return !open;
        });
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    soundManager?.playAction();
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={() => setOpen(false)} 
      />
      <Command 
        className="w-full max-w-xl bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200"
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        <div className="flex items-center border-b border-white/10 px-4 py-3">
          <Search className="w-5 h-5 text-neutral-400 mr-3" />
          <Command.Input 
            autoFocus 
            placeholder="Search or jump to..." 
            className="w-full bg-transparent border-none text-white focus:outline-none placeholder:text-neutral-500 text-lg" 
          />
        </div>

        <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-none">
          <Command.Empty className="py-6 text-center text-sm text-neutral-400">
            No results found.
          </Command.Empty>

          <Command.Group heading={<div className="px-2 py-1.5 text-xs font-semibold text-neutral-500">Navigation</div>}>
            <Command.Item
              onSelect={() => runCommand(() => router.push('/'))}
              onMouseEnter={() => soundManager?.playHover()}
              className="flex items-center px-4 py-3 rounded-xl cursor-pointer hover:bg-white/5 aria-selected:bg-white/10 text-white transition-colors"
            >
              <Compass className="w-5 h-5 mr-3 text-pastel-peach" />
              <span>Dashboard Home</span>
              <ChevronRight className="w-4 h-4 ml-auto text-neutral-500" />
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push('/marketplace'))}
              onMouseEnter={() => soundManager?.playHover()}
              className="flex items-center px-4 py-3 rounded-xl cursor-pointer hover:bg-white/5 aria-selected:bg-white/10 text-white transition-colors"
            >
              <ShoppingBag className="w-5 h-5 mr-3 text-pastel-mint" />
              <span>Marketplace</span>
              <ChevronRight className="w-4 h-4 ml-auto text-neutral-500" />
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push('/clubs'))}
              onMouseEnter={() => soundManager?.playHover()}
              className="flex items-center px-4 py-3 rounded-xl cursor-pointer hover:bg-white/5 aria-selected:bg-white/10 text-white transition-colors"
            >
              <Users className="w-5 h-5 mr-3 text-pastel-blue" />
              <span>Clubs & Chapters</span>
              <ChevronRight className="w-4 h-4 ml-auto text-neutral-500" />
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push('/events'))}
              onMouseEnter={() => soundManager?.playHover()}
              className="flex items-center px-4 py-3 rounded-xl cursor-pointer hover:bg-white/5 aria-selected:bg-white/10 text-white transition-colors"
            >
              <Calendar className="w-5 h-5 mr-3 text-pastel-lavender" />
              <span>Campus Events</span>
              <ChevronRight className="w-4 h-4 ml-auto text-neutral-500" />
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push('/academic'))}
              onMouseEnter={() => soundManager?.playHover()}
              className="flex items-center px-4 py-3 rounded-xl cursor-pointer hover:bg-white/5 aria-selected:bg-white/10 text-white transition-colors"
            >
              <BookOpen className="w-5 h-5 mr-3 text-pastel-yellow" />
              <span>Academic Hub</span>
              <ChevronRight className="w-4 h-4 ml-auto text-neutral-500" />
            </Command.Item>
            <Command.Item
              onSelect={() => runCommand(() => router.push('/axios'))}
              onMouseEnter={() => soundManager?.playHover()}
              className="flex items-center px-4 py-3 rounded-xl cursor-pointer hover:bg-white/5 aria-selected:bg-white/10 text-white transition-colors"
            >
              <Shield className="w-5 h-5 mr-3 text-red-400" />
              <span>Axios (Student Technical Society)</span>
              <ChevronRight className="w-4 h-4 ml-auto text-neutral-500" />
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
