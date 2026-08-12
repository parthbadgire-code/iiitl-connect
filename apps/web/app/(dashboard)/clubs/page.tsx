"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Building2, Calendar, MapPin, Users, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@parthbadgire/ui/components/card";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { motion, useScroll, useTransform } from "framer-motion";

type Club = {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  _count: {
    members: number;
    events: number;
  };
};

type CampusEvent = {
  id: string;
  title: string;
  date: string;
  venue: string;
  isRSVPRequired: boolean;
  club: {
    name: string;
    slug: string;
    logo: string;
  };
  _count: { rsvps: number };
};

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [clubsRes, eventsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/clubs`, { credentials: "include" }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/events`, { credentials: "include" })
      ]);

      if (clubsRes.ok) setClubs(await clubsRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#050505]">
        <PremiumLoader />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 relative">
      <motion.div style={{ y, opacity }} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 relative z-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white drop-shadow-lg">
            Campus <span className="bg-gradient-to-r from-pastel-lavender to-pastel-blue bg-clip-text text-transparent">Clubs</span>
          </h1>
          <p className="text-neutral-400 mt-2 font-medium">
            Discover, join, and interact with student organizations at IIITL.
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Clubs Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-pastel-lavender" /> Active Organizations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {clubs.map((club) => (
              <Link key={club.id} href={`/clubs/${club.id}`}>
                <Card className="bg-black/40 backdrop-blur-xl border border-white/5 hover:border-pastel-lavender/30 transition-all duration-500 cursor-pointer group h-full flex flex-col rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-pastel-lavender/10">
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner p-2">
                        <Image
                          src={`/clubs/${club.slug}.png`}
                          alt={club.name}
                          fill
                          className="object-contain p-2 transition-transform duration-500 group-hover:scale-110 drop-shadow-md"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <Building2 className="h-8 w-8 text-neutral-400 hidden" />
                      </div>
                      <div className="pt-1">
                        <h3 className="font-bold text-lg text-white group-hover:text-pastel-lavender transition-colors flex items-center gap-1.5">
                          {club.name}
                          <ExternalLink className="h-4 w-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                        </h3>
                        <p className="text-xs text-neutral-400 mt-0.5 line-clamp-2">
                          {club.description || "No description provided."}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold text-neutral-400 mt-auto pt-4 border-t border-white/5">
                      <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {club._count.members} Members</span>
                      <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {club._count.events} Events</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {clubs.length === 0 && (
              <div className="col-span-full py-12 text-center border border-dashed border-zinc-800 rounded-xl">
                <p className="text-zinc-500">No clubs registered yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Events Timeline */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-pastel-lavender" /> Upcoming Events
          </h2>
          <Card className="bg-[#0A0A0A]/50 backdrop-blur-xl border border-white/5 rounded-3xl sticky top-8 overflow-hidden shadow-2xl">
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {events.map((event) => {
                  const dateObj = new Date(event.date);
                  return (
                    <div key={event.id} className="p-4 hover:bg-white/5 transition-colors flex gap-4">
                      <div className="flex flex-col items-center justify-center h-12 w-12 rounded-lg bg-pastel-lavender/10 border border-pastel-lavender/20 shrink-0 text-center">
                        <span className="text-[10px] font-bold text-pastel-lavender uppercase leading-none mb-1">
                          {dateObj.toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="text-lg font-black text-pastel-lavender leading-none">
                          {dateObj.getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-white truncate">{event.title}</h4>
                        <p className="text-xs text-pastel-lavender font-medium truncate mb-1">Hosted by {event.club.name}</p>
                        <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                          <MapPin className="h-3 w-3" /> {event.venue}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {events.length === 0 && (
                  <div className="p-8 text-center text-zinc-500 text-sm">
                    No upcoming events scheduled.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
