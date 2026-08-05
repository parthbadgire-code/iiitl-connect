"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Calendar, MapPin, Users, Plus, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@parthbadgire/ui/components/card";
import { Button } from "@parthbadgire/ui/components/button";

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
        fetch("http://localhost:3001/clubs", { credentials: "include" }),
        fetch("http://localhost:3001/events", { credentials: "include" })
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
      const res = await fetch("http://localhost:3001/clubs", {
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
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1 w-6 rounded-full" style={{ background: "linear-gradient(90deg, #f59e0b, #ef4444)" }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#8b8ba7" }}>
              Campus Organizations
            </span>
          </div>
          <h1 className="text-4xl font-black text-zinc-100">
            Clubs & <span className="text-amber-500">Events</span>
          </h1>
        </div>
        <Button 
          onClick={() => setShowNewClub(!showNewClub)}
          className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
        >
          <Plus className="h-4 w-4" /> Register New Club
        </Button>
      </div>

      {showNewClub && (
        <Card className="glass-card bg-zinc-950 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
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
                      // Auto-generate slug
                      if (!newClubSlug || newClubSlug === newClubName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')) {
                        setNewClubSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                      }
                    }}
                    placeholder="e.g. Axios"
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/50 text-zinc-100"
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
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/50 text-zinc-100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400">DESCRIPTION</label>
                <textarea
                  value={newClubDesc}
                  onChange={e => setNewClubDesc(e.target.value)}
                  placeholder="What does your club do?"
                  className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/50 resize-none h-20 text-zinc-100"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowNewClub(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-700 text-white">
                  {isSubmitting ? "Registering..." : "Register Club"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Clubs Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-amber-500" /> Active Organizations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {clubs.map((club) => (
              <Link key={club.id} href={`/clubs/${club.id}`}>
                <Card className="glass-card bg-zinc-950/80 border-zinc-800 hover:border-amber-500/50 hover:bg-zinc-900/80 transition-all cursor-pointer group h-full flex flex-col">
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="h-12 w-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                        {club.logo ? (
                          <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="h-6 w-6 text-zinc-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-zinc-100 group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                          {club.name}
                          <ExternalLink className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        </h3>
                        <p className="text-xs text-zinc-500">@{club.slug}</p>
                      </div>
                    </div>
                    {club.description && (
                      <p className="text-sm text-zinc-400 line-clamp-2 flex-1 mb-4">{club.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500 mt-auto pt-4 border-t border-zinc-800/50">
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
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-red-500" /> Upcoming Events
          </h2>
          <Card className="glass-card bg-zinc-950/80 border-zinc-800 sticky top-8">
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-800/50">
                {events.map((event) => {
                  const dateObj = new Date(event.date);
                  return (
                    <div key={event.id} className="p-4 hover:bg-zinc-900/50 transition-colors flex gap-4">
                      <div className="flex flex-col items-center justify-center h-12 w-12 rounded-lg bg-red-500/10 border border-red-500/20 shrink-0 text-center">
                        <span className="text-[10px] font-bold text-red-500 uppercase leading-none mb-1">
                          {dateObj.toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="text-lg font-black text-red-400 leading-none">
                          {dateObj.getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-zinc-100 truncate">{event.title}</h4>
                        <p className="text-xs text-amber-500 font-medium truncate mb-1">Hosted by {event.club.name}</p>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
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
