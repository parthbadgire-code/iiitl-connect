"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Calendar, MapPin, Users, Plus, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@parthbadgire/ui/components/card";

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

  // New Club State
  const [showNewClub, setShowNewClub] = useState(false);
  const [newClubName, setNewClubName] = useState("");
  const [newClubSlug, setNewClubSlug] = useState("");
  const [newClubDesc, setNewClubDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/clubs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: newClubName,
          slug: newClubSlug,
          description: newClubDesc
        }),
      });
      if (res.ok) {
        setShowNewClub(false);
        setNewClubName("");
        setNewClubSlug("");
        setNewClubDesc("");
        fetchData(); // Refresh list
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-zinc-500">Loading Clubs & Events...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1 w-6 rounded-full bg-pastel-lavender" />
            <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
              Campus Organizations
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-white">
            Clubs & <span className="bg-gradient-to-r from-pastel-lavender to-pastel-blue bg-clip-text text-transparent"></span>
          </h1>
        </div>
        <button
          onClick={() => setShowNewClub(!showNewClub)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 bg-pastel-lavender text-black hover:bg-pastel-lavender/90 hover:scale-105"
        >
          <Plus className="h-4 w-4" /> Register New Club
        </button>
      </div>

      {showNewClub && (
        <Card className="bg-black/40 backdrop-blur-xl border-pastel-lavender/30 rounded-3xl p-2 shadow-[0_0_30px_rgba(233,213,255,0.1)]">
          <CardHeader>
            <CardTitle>Register a New Club</CardTitle>
            <CardDescription>You will automatically be assigned the LEAD role.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateClub} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400">CLUB NAME</label>
                  <input
                    required
                    type="text"
                    value={newClubName}
                    onChange={e => {
                      setNewClubName(e.target.value);
                      if (!newClubSlug || newClubSlug === newClubName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')) {
                        setNewClubSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                      }
                    }}
                    placeholder="e.g. Axios"
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pastel-lavender transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400">SLUG (URL)</label>
                  <input
                    required
                    type="text"
                    value={newClubSlug}
                    onChange={e => setNewClubSlug(e.target.value)}
                    placeholder="e.g. axios"
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pastel-lavender transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400">DESCRIPTION</label>
                <textarea
                  value={newClubDesc}
                  onChange={e => setNewClubDesc(e.target.value)}
                  placeholder="What does your club do?"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pastel-lavender transition-colors resize-none h-20"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowNewClub(false)} className="text-sm font-semibold px-4 py-2 text-neutral-400 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-pastel-lavender text-black hover:bg-pastel-lavender/90 disabled:opacity-50 transition-all">
                  {isSubmitting ? "Registering..." : "Register Club"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Clubs Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-pastel-lavender" /> Active Organizations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {clubs.map((club) => (
              <Link key={club.id} href={`/clubs/${club.id}`}>
                <Card className="bg-[#0A0A0A]/50 backdrop-blur-xl border-white/5 hover:border-pastel-lavender/50 transition-all duration-300 cursor-pointer group h-full flex flex-col rounded-3xl">
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="h-12 w-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                        {club.logo ? (
                          <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="h-6 w-6 text-zinc-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-white group-hover:text-pastel-lavender transition-colors flex items-center gap-1.5">
                          {club.name}
                          <ExternalLink className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        </h3>
                        <p className="text-xs text-neutral-500">@{club.slug}</p>
                      </div>
                    </div>
                    {club.description && (
                      <p className="text-sm text-zinc-400 line-clamp-2 flex-1 mb-4">{club.description}</p>
                    )}
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
