/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@parthbadgire/ui/components/card";
import { Terminal, Code, Cpu, Shield, Smartphone, PenTool, Database, Globe } from "lucide-react";
import Link from "next/link";

type Club = {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  _count: { members: number; events: number };
};

import React from "react";

const WING_ICONS: Record<string, React.ElementType> = {
  "axios-cp": Terminal,
  "axios-web": Globe,
  "axios-foss": Code,
  "axios-web3": Database,
  "axios-infosec": Shield,
  "axios-app": Smartphone,
  "axios-design": PenTool,
};

const WING_COLORS: Record<string, string> = {
  "axios-cp": "from-pastel-mint to-pastel-blue",
  "axios-web": "from-pastel-lavender to-pastel-pink",
  "axios-foss": "from-pastel-yellow to-pastel-peach",
  "axios-web3": "from-pastel-blue to-pastel-lavender",
  "axios-infosec": "from-red-400 to-pink-500",
  "axios-app": "from-green-400 to-emerald-600",
  "axios-design": "from-purple-400 to-pastel-lavender",
};

export default function AxiosHubPage() {
  const [wings, setWings] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWings();
  }, []);

  const fetchWings = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/clubs`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        // Filter only Axios wings
        setWings(data.filter((c: Club) => c.slug.startsWith("axios-")));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-neutral-500">Loading Axios Hub...</div>;
  }

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 overflow-y-auto w-full max-w-[1400px] mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1 w-6 rounded-full bg-pastel-lavender" />
            <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
              Technical Society
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white">
            Axios <span className="bg-gradient-to-r from-pastel-lavender to-pastel-blue bg-clip-text text-transparent">Hub</span>
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wings.map((wing) => {
          const Icon = WING_ICONS[wing.slug] || Cpu;
          const gradient = WING_COLORS[wing.slug] || "from-neutral-700 to-neutral-900";
          
          return (
            <Link key={wing.id} href={`/axios/${wing.slug}`}>
              <Card className="group relative overflow-hidden bg-[#0A0A0A]/50 backdrop-blur-xl border-white/5 shadow-2xl rounded-3xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(233,213,255,0.1)] h-full">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <CardContent className="p-6 h-full flex flex-col">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-lg mb-4 transform group-hover:rotate-6 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{wing.name}</h3>
                  <p className="text-sm text-neutral-400 flex-1">{wing.description}</p>
                  <div className="mt-6 flex items-center gap-4 text-xs font-medium text-neutral-500">
                    <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                      <div className="h-1.5 w-1.5 rounded-full bg-pastel-lavender" />
                      {wing._count.members} Members
                    </span>
                    <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                      <div className="h-1.5 w-1.5 rounded-full bg-pastel-blue" />
                      {wing._count.events} Events
                    </span>
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
