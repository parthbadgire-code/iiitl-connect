"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUIStore } from "@/store/useUIStore";
import { MinimalParticles } from "@/components/ui/MinimalParticles";
import { soundManager } from "@/lib/sound";
import { BookOpen, Sparkles, ShoppingBag, Calendar, Users, Building2, Shield, ArrowRight, Compass, Briefcase } from "lucide-react";

const MODULES = [
  {
    title: "Academic Hub",
    description: "Access PYQs, notes, and study resources",
    icon: BookOpen,
    href: "/academic",
    id: "academic",
    color: "#E9D5FF",
    span: "md:col-span-2 md:row-span-2",
    bg: "bg-pastel-lavender/5",
    iconClass: "h-24 w-24 md:h-32 md:w-32",
    iconWrapperClass: "p-4 md:p-6"
  },
  {
    title: "Anonymous Chat",
    description: "Share secrets anonymously.",
    icon: Sparkles,
    href: "/anonymous-chat",
    id: "anonymous-chat",
    color: "#A7F3D0",
    span: "md:col-span-1 md:row-span-1",
    bg: "bg-pastel-mint/5"
  },
  {
    title: "Campus Events",
    description: "RSVP to fests & workshops",
    icon: Calendar,
    href: "/events",
    id: "events",
    color: "#BAE6FD",
    span: "md:col-span-1 md:row-span-1",
    bg: "bg-pastel-blue/5"
  },
  {
    title: "Marketplace",
    description: "Buy & sell goods locally",
    icon: ShoppingBag,
    href: "/marketplace",
    id: "marketplace",
    color: "#FFDAB9",
    span: "md:col-span-1 md:row-span-2",
    bg: "bg-pastel-peach/5"
  },
  {
    title: "Clubs & Societies",
    description: "Join campus organizations",
    icon: Building2,
    href: "/clubs",
    id: "clubs",
    color: "#E9D5FF",
    span: "md:col-span-1 md:row-span-1",
    bg: "bg-pastel-lavender/5"
  },
  {
    title: "Axios",
    description: "Student Technical Society",
    icon: Shield,
    href: "/axios",
    id: "axios",
    color: "#A7F3D0",
    span: "md:col-span-1 md:row-span-1",
    bg: "bg-pastel-mint/5"
  },
  {
    title: "Connections",
    description: "Find your people",
    icon: Users,
    href: "/connections",
    id: "connections",
    color: "#BAE6FD",
    span: "md:col-span-1 md:row-span-1",
    bg: "bg-pastel-blue/5"
  },
  {
    title: "Placements",
    description: "Prep, Reviews & Opportunities",
    icon: Briefcase,
    href: "/placements",
    id: "placements",
    color: "#E9D5FF",
    span: "md:col-span-1 md:row-span-1",
    bg: "bg-pastel-lavender/5"
  }
];

export default function DashboardHome() {
  const [mounted, setMounted] = useState(false);
  const setActiveTile = useUIStore((state) => state.setActiveTile);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <MinimalParticles />
      <div className="mx-auto max-w-6xl space-y-12 p-4 pt-8 md:p-8 relative z-10">
      
      {/* Hero Section */}
      <div className={`space-y-4 text-center transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-white">
          Welcome to <span className="bg-gradient-to-r from-pastel-lavender to-pastel-blue bg-clip-text text-transparent">IIITL Connect</span>
        </h1>
        <p className="text-neutral-400 max-w-xl mx-auto text-sm md:text-base">
          Your unified campus operating system. Access academics, anonymous boards, marketplace, and more from a single hub.
        </p>
        <div className="pt-6">
          <Link href="/guide" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-pastel-mint to-pastel-blue text-black font-extrabold hover:scale-105 transition-transform shadow-[0_0_30px_rgba(167,243,208,0.3)]">
            <Compass className="h-5 w-5" />
            Take a Tour of IIITL.Connect
          </Link>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[160px]">
        {MODULES.map((mod, i) => (
          <Link
            key={i}
            href={mod.href}
            onMouseEnter={() => {
              setActiveTile(mod.id);
              soundManager?.playHover();
            }}
            onMouseLeave={() => setActiveTile(null)}
            onClick={() => soundManager?.playAction()}
            className={`group relative overflow-hidden rounded-3xl p-6 flex flex-col justify-between transition-all duration-700 hover:scale-[1.02] hover:-translate-y-2 hover:shadow-2xl hover:shadow-white/5 ${mod.span} ${mod.bg} border border-white/5 hover:border-white/20`}
            style={{ 
              animationDelay: `${i * 100}ms`,
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(20px)"
            }}
          >
            {/* Background Glow */}
            <div className="absolute -right-20 -top-20 w-40 h-40 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
              style={{ background: mod.color }} />

            <div className="relative z-10 flex items-start justify-between">
              <div className={`${mod.iconWrapperClass || "p-3"} rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
                style={{ color: mod.color }}>
                <mod.icon className={mod.iconClass || "h-6 w-6"} />
              </div>
              <div className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0"
                style={{ color: mod.color }}>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>

            <div className="relative z-10 mt-4">
              <h3 className="text-xl font-bold text-white mb-1 tracking-tight">{mod.title}</h3>
              <p className="text-sm text-neutral-400">{mod.description}</p>
            </div>
          </Link>
        ))}
      </div>
      
    </div>
    </>
  );
}
