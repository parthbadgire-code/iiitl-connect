"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Ghost, ShoppingBag, Calendar, Terminal } from "lucide-react";
import { cn } from "@parthbadgire/ui/lib/utils";

const navigation = [
  { name: "Academic Hub", href: "/academic", icon: BookOpen },
  { name: "Confessions", href: "/confessions", icon: Ghost },
  { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { name: "Events", href: "/events", icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex h-14 items-center px-4 border-b border-zinc-800">
        <Terminal className="mr-2 h-6 w-6 text-zinc-50" />
        <span className="font-bold text-zinc-50 tracking-tight">IIITL Connect</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-zinc-900 text-zinc-50"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-50"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive ? "text-zinc-50" : "text-zinc-400 group-hover:text-zinc-50"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
