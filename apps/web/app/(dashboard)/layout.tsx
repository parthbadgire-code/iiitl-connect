"use client";

import { Topbar } from "@/components/layout/topbar";
import { useSession } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isPending && !session && pathname !== "/about") {
      const searchParams = new URLSearchParams(window.location.search);
      const queryString = searchParams.toString();
      router.push(queryString ? `/login?${queryString}` : "/login");
    }
  }, [session, isPending, router, pathname]);

  if (isPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#050505]">
        <Loader2 className="h-8 w-8 animate-spin text-pastel-lavender" />
      </div>
    );
  }

  if (!session && pathname !== "/about") {
    return null;
  }
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#050505]">
      {/* Animated background glows */}
      <div className="campus-bg" aria-hidden="true">
        <div className="campus-bg-grid" />
        <div className="campus-bg-orb3" />
      </div>

      {/* Top Header */}
      <Topbar />

      {/* Scrollable Page Content */}
      <main className="relative flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
