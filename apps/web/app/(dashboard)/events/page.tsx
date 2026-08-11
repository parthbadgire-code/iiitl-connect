"use client";

import { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, Users, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Button } from "@parthbadgire/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@parthbadgire/ui/components/dialog";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  clubs: {
    name: string;
  }[];
}

export default function EventsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.email === "lit2025021@iiitl.ac.in";

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Event State
  const [clubs, setClubs] = useState<{ id: string; name: string }[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventClubIds, setEventClubIds] = useState<string[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchEvents();
    if (isAdmin) fetchClubs();
  }, [isAdmin]);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/events`, { credentials: "include" });
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

  const fetchClubs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/clubs`, { credentials: "include" });
      if (res.ok) setClubs(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (eventClubIds.length === 0) return alert("Please select at least one club");
    setIsAddingEvent(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: eventTitle,
          date: eventDate,
          venue: eventVenue,
          clubIds: eventClubIds,
        }),
      });
      if (res.ok) {
        setIsDialogOpen(false);
        setEventTitle("");
        setEventDate("");
        setEventVenue("");
        setEventClubIds([]);
        fetchEvents();
      } else {
        alert("Failed to create event");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating event");
    } finally {
      setIsAddingEvent(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pastel-blue/10 border border-pastel-blue/20">
            <Calendar className="h-7 w-7 text-pastel-blue" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-white">Campus <span className="bg-gradient-to-r from-pastel-blue to-pastel-mint bg-clip-text text-transparent">Events</span></h1>
            <p className="text-sm text-neutral-400">Discover and RSVP to fests, hackathons, and workshops.</p>
          </div>
        </div>

        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-pastel-blue hover:bg-pastel-blue/90 text-black gap-2 font-bold px-6">
                <Plus className="h-4 w-4" /> Host Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-black/60 backdrop-blur-xl border-white/10 text-white shadow-2xl">
              <DialogHeader>
                <DialogTitle>Host New Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">Event Title</label>
                  <input
                    required
                    value={eventTitle}
                    onChange={e => setEventTitle(e.target.value)}
                    placeholder="e.g. Hacktoberfest Sync"
                    className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl text-sm focus:border-pastel-blue outline-none text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">Date & Time</label>
                  <input
                    required
                    type="datetime-local"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl text-sm focus:border-pastel-blue outline-none text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">Venue</label>
                  <input
                    required
                    value={eventVenue}
                    onChange={e => setEventVenue(e.target.value)}
                    placeholder="e.g. LT-1"
                    className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl text-sm focus:border-pastel-blue outline-none text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">Select Clubs</label>
                  <div className="max-h-40 overflow-y-auto space-y-2 p-3 bg-black/50 border border-white/10 rounded-xl">
                    {clubs.map(club => (
                      <label key={club.id} className="flex items-center gap-2 text-sm text-white cursor-pointer hover:text-pastel-blue transition-colors">
                        <input
                          type="checkbox"
                          checked={eventClubIds.includes(club.id)}
                          onChange={e => {
                            if (e.target.checked) setEventClubIds([...eventClubIds, club.id]);
                            else setEventClubIds(eventClubIds.filter(id => id !== club.id));
                          }}
                          className="rounded border-white/10 bg-black/50 text-pastel-blue focus:ring-pastel-blue focus:ring-offset-black"
                        />
                        {club.name}
                      </label>
                    ))}
                  </div>
                </div>
                <Button type="submit" disabled={isAddingEvent || eventClubIds.length === 0} className="w-full bg-pastel-blue hover:bg-pastel-blue/90 text-black mt-4 font-bold rounded-xl">
                  {isAddingEvent ? "Creating..." : "Create Event"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Events List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-pastel-blue" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl">
          <Calendar className="h-10 w-10 text-neutral-500 mx-auto mb-4" />
          <p className="text-neutral-400">No upcoming events found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <Link href={`/events/${event.id}`} key={event.id} className="group p-6 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/5 hover:border-pastel-blue/30 transition-all duration-500 relative overflow-hidden shadow-2xl block cursor-pointer">
              <div className="absolute top-0 right-0 p-8 w-32 h-32 bg-pastel-blue/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-pastel-blue/20 transition-colors" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-pastel-blue/10 text-pastel-blue border border-pastel-blue/20 max-w-[200px] truncate">
                    <Users className="h-3 w-3 shrink-0" /> <span className="truncate">{event.clubs?.map(c => c.name).join(', ')}</span>
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
                    {event.venue}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
