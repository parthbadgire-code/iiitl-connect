"use client";

import { Card, CardContent } from "@parthbadgire/ui/components/card";
import { 
  Heart, 
  Terminal, 
  ShoppingCart, 
  BookOpen, 
  MapPin, 
  MessageSquare,
  Sparkles,
  Search,
  Building2,
  Users
} from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    id: "connections",
    title: "Connections",
    description: "A privacy-first matchmaking platform designed for campus life. Find your next study partner, gym buddy, or hackathon teammate. Profiles remain anonymous with pseudonyms until you match, at which point real identities are revealed and secure chat unlocks.",
    icon: Heart,
    color: "from-pastel-blue to-pastel-pink",
    href: "/connections",
    highlights: ["Anonymous Discovery", "Mutual Matching", "In-App Secure Chat"]
  },
  {
    id: "axios",
    title: "Axios Hub",
    description: "The central nervous system for IIITL's Technical Society. Explore the different wings (CP, Web, ML, InfoSec, etc.), view the core members and coordinators, and access exclusive class materials and assignments uploaded by the leads.",
    icon: Terminal,
    color: "from-pastel-lavender to-pastel-blue",
    href: "/axios",
    highlights: ["Wing Rosters", "Class Resources", "Overall Coordinators"]
  },
  {
    id: "academic",
    title: "Academic Hub",
    description: "Your centralized repository for everything curriculum-related. Access and share notes, past year papers, textbooks, and assignment solutions categorized seamlessly by semester and subject.",
    icon: BookOpen,
    color: "from-pastel-mint to-pastel-blue",
    href: "/academic",
    highlights: ["Notes & PYQs", "Semester Filtering", "Community Uploads"]
  },
  {
    id: "marketplace",
    title: "Marketplace",
    description: "The official on-campus economy. Looking to buy a second-hand mattress, sell your old cooler, or trade textbooks? The marketplace connects buyers and sellers securely within the campus perimeter.",
    icon: ShoppingCart,
    color: "from-pastel-peach to-pastel-yellow",
    href: "/marketplace",
    highlights: ["Buy & Sell", "Campus-Only", "Direct Contact"]
  },
  {
    id: "clubs",
    title: "Campus Clubs",
    description: "Discover and join active campus organizations. See their upcoming events, track membership numbers, and directly engage with club leads. Or, register your own club and start building a community.",
    icon: Building2,
    color: "from-pastel-pink to-pastel-lavender",
    href: "/clubs",
    highlights: ["Event Timelines", "Club Registration", "Member Tracking"]
  },
  {
    id: "lost-found",
    title: "Lost & Found",
    description: "Lost your ID card or found a stray pair of AirPods? Post it here. This campus-wide board ensures misplaced items find their way back to their rightful owners quickly.",
    icon: MapPin,
    color: "from-red-400 to-pink-500",
    href: "/lost-found",
    highlights: ["Active Board", "Image Support", "Claim Items"]
  },
  {
    id: "anonymous-chat",
    title: "Confessions & Chat",
    description: "Speak your mind without attaching your name. A secure space for campus confessions, late-night thoughts, and anonymous discussions, fully encrypted and safe.",
    icon: MessageSquare,
    color: "from-green-400 to-emerald-600",
    href: "/anonymous-chat",
    highlights: ["Total Anonymity", "Real-Time Feed", "Zero Tracking"]
  }
];

export default function GuidePage() {
  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-[1400px] mx-auto animate-fade-in space-y-10">
      
      {/* Header Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto py-8">
        <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center bg-pastel-lavender/10 border border-pastel-lavender/20 mb-4">
          <Sparkles className="h-8 w-8 text-pastel-lavender" />
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
          Welcome to <span className="bg-gradient-to-r from-pastel-lavender to-pastel-blue bg-clip-text text-transparent">iiitl.connect</span>
        </h1>
        <p className="text-lg text-neutral-400">
          The ultimate digital campus operating system. Explore everything you can do, from finding love and sharing notes, to buying goods and joining tech wings.
        </p>
      </div>

      {/* Global Search Tip */}
      <Card className="bg-gradient-to-r from-pastel-lavender/5 to-pastel-blue/5 border-white/5 rounded-3xl max-w-4xl mx-auto">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
            <Search className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-white mb-2">Global Campus Directory</h3>
            <p className="text-neutral-400 text-sm">
              Need to find someone? Use the search bar in the top navigation to instantly look up any student on campus, view their batch, branch, and role, or jump straight to their public profile.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.id} href={feature.href} className="group">
              <Card className="h-full bg-[#0A0A0A]/50 backdrop-blur-xl border-white/5 shadow-2xl rounded-3xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-white/10 flex flex-col relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                <CardContent className="p-6 md:p-8 flex-1 flex flex-col">
                  
                  <div className={`h-14 w-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feature.color} shadow-lg mb-6 transform group-hover:rotate-6 transition-transform`}>
                    <Icon className="h-7 w-7 text-black" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-sm text-neutral-400 flex-1 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="mt-8 flex flex-wrap gap-2">
                    {feature.highlights.map((highlight, i) => (
                      <span key={i} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                        {highlight}
                      </span>
                    ))}
                  </div>

                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
