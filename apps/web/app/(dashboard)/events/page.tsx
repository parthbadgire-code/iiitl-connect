"use client";

import { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, Users, Loader2 } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  club: {
    name: string;
  };
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("http://localhost:3001/events", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl bg-[#0A0A0A]/50 border-neutral-800/80">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pastel-blue/10 border border-pastel-blue/20">
            <Calendar className="h-7 w-7 text-pastel-blue" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-white">Campus <span className="bg-gradient-to-r from-pastel-blue to-pastel-mint bg-clip-text text-transparent">Events</span></h1>
            <p className="text-sm text-neutral-400">Discover and RSVP to fests, hackathons, and workshops.</p>
          </div>
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-pastel-blue" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl border-neutral-800/80">
          <Calendar className="h-10 w-10 text-neutral-500 mx-auto mb-4" />
          <p className="text-neutral-400">No upcoming events found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div key={event.id} className="group glass-card p-6 rounded-3xl bg-[#0A0A0A]/80 border-neutral-800/80 hover:border-pastel-blue/50 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 w-32 h-32 bg-pastel-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-pastel-blue/20 transition-colors" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pastel-blue/10 text-pastel-blue border border-pastel-blue/20">
                    <Users className="h-3 w-3" /> {event.club.name}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{event.title}</h3>
                <p className="text-sm text-neutral-400 mb-6 flex-1">{event.description}</p>
                
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3 text-sm text-neutral-300">
                    <Clock className="h-4 w-4 text-pastel-mint" />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-300">
                    <MapPin className="h-4 w-4 text-pastel-peach" />
                    {event.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
