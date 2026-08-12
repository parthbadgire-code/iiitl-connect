"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Briefcase, FileText, Globe } from "lucide-react";
import { MinimalParticles } from "@/components/ui/MinimalParticles";

const PLACEMENT_MODULES = [
  {
    title: "Interview Experiences",
    description: "Read & share interview experiences by company and role.",
    icon: BookOpen,
    href: "/placements/interview-experiences",
    color: "#BAE6FD", // pastel blue
    bg: "bg-pastel-blue/5"
  },
  {
    title: "Resume Reviews",
    description: "Get your resume reviewed by seniors or help juniors.",
    icon: FileText,
    href: "/placements/resume-reviews",
    color: "#E9D5FF", // pastel lavender
    bg: "bg-pastel-lavender/5"
  },
  {
    title: "Off-Campus Opportunities",
    description: "Track off-campus openings and deadline reminders.",
    icon: Globe,
    href: "/placements/off-campus",
    color: "#A7F3D0", // pastel mint
    bg: "bg-pastel-mint/5"
  },
  {
    title: "OA Question Bank",
    description: "Coding questions tagged by company and difficulty.",
    icon: Briefcase,
    href: "/placements/oa-questions",
    color: "#FDE047", // pastel yellow
    bg: "bg-pastel-yellow/5"
  }
];

export default function PlacementsDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <MinimalParticles />
      <div className="mx-auto max-w-6xl space-y-12 p-4 pt-8 md:p-8 relative z-10">
        
        {/* Header */}
        <div className={`space-y-4 text-center transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border bg-white/5 border-white/10 text-white backdrop-blur-md mx-auto">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pastel-lavender opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pastel-lavender"></span>
            </span>
            Career Hub
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white">
            Placements & <span className="bg-gradient-to-r from-pastel-lavender to-pastel-blue bg-clip-text text-transparent">Internships</span>
          </h1>
          <p className="text-neutral-400 max-w-xl mx-auto text-sm md:text-base">
            Your ultimate hub for interview prep, resume building, and finding the best off-campus opportunities.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {PLACEMENT_MODULES.map((mod, i) => (
            <Link
              key={i}
              href={mod.href}
              className={`group relative overflow-hidden rounded-3xl p-6 flex flex-col justify-between transition-all duration-700 hover:scale-[1.02] hover:-translate-y-2 hover:shadow-2xl hover:shadow-white/5 h-48 ${mod.bg} border border-white/5 hover:border-white/20`}
              style={{ 
                animationDelay: `${i * 100}ms`,
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(20px)"
              }}
            >
              <div 
                className="absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20"
                style={{ backgroundColor: mod.color }}
              />
              <div className="relative z-10 flex justify-between items-start">
                <div 
                  className="rounded-2xl p-3 backdrop-blur-sm bg-white/5 border border-white/10"
                  style={{ color: mod.color }}
                >
                  <mod.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="relative z-10 mt-auto">
                <h3 className="text-xl font-bold text-white mb-2">{mod.title}</h3>
                <p className="text-sm text-neutral-400 max-w-[80%] line-clamp-2">
                  {mod.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
