"use client";

import { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, Users, Plus } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Button } from "@parthbadgire/ui/components/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
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
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Add Event State
  const [clubs, setClubs] = useState<{ id: string; name: string }[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [eventExternalLink, setEventExternalLink] = useState("");
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
      const payload = {
        title: eventTitle,
        date: new Date(eventDate).toISOString(),
        venue: eventVenue,
        clubIds: eventClubIds,
        ...(eventExternalLink && { externalLink: eventExternalLink })
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setIsDialogOpen(false);
        setEventTitle("");
        setEventDate("");
        setEventVenue("");
        setEventExternalLink("");
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
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 relative">
      <motion.div style={{ y, opacity }} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 relative z-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white drop-shadow-lg">
            Campus <span className="bg-gradient-to-r from-pastel-blue to-pastel-lavender bg-clip-text text-transparent">Events</span>
          </h1>
          <p className="text-neutral-400 mt-2 font-medium">
            Discover and join upcoming events at IIITL.
          </p>
        </div>

        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 bg-gradient-to-r from-pastel-blue to-pastel-mint text-black hover:opacity-90 font-bold px-6 py-2.5 rounded-xl shadow-[0_0_20px_rgba(167,243,208,0.3)] transition-all">
                <Plus className="h-4 w-4" /> Host Event
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[#0A0A0A] border border-white/10 text-white shadow-2xl rounded-3xl p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-blue/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-pastel-mint/10 rounded-full blur-3xl" />
              
              <DialogHeader className="relative z-10">
                <DialogTitle className="text-2xl font-black">Host New Event</DialogTitle>
                <p className="text-sm text-neutral-400 mt-1">Broadcast an event to the campus community.</p>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4 pt-4 relative z-10">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Event Title</label>
                  <input
                    required
                    value={eventTitle}
                    onChange={e => setEventTitle(e.target.value)}
                    placeholder="e.g. Hacktoberfest Sync"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-pastel-blue focus:bg-white/10 outline-none text-white transition-all placeholder:text-white/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Date & Time</label>
                  <input
                    required
                    type="datetime-local"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-pastel-blue focus:bg-white/10 outline-none text-white transition-all [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Venue</label>
                  <input
                    required
                    value={eventVenue}
                    onChange={e => setEventVenue(e.target.value)}
                    placeholder="e.g. LT-1"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-pastel-blue focus:bg-white/10 outline-none text-white transition-all placeholder:text-white/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Registration / External Link (Optional)</label>
                  <input
                    value={eventExternalLink}
                    onChange={e => setEventExternalLink(e.target.value)}
                    placeholder="e.g. https://unstop.com/..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-pastel-blue focus:bg-white/10 outline-none text-white transition-all placeholder:text-white/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Select Clubs</label>
                  <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-white/5 border border-white/10 rounded-xl custom-scrollbar">
                    {clubs.map(club => (
                      <label key={club.id} className="flex items-center gap-3 text-sm text-neutral-200 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                        <input
                          type="checkbox"
                          checked={eventClubIds.includes(club.id)}
                          onChange={e => {
                            if (e.target.checked) setEventClubIds([...eventClubIds, club.id]);
                            else setEventClubIds(eventClubIds.filter(id => id !== club.id));
                          }}
                          className="h-4 w-4 rounded border-white/20 bg-black/50 text-pastel-blue focus:ring-pastel-blue focus:ring-offset-black accent-pastel-blue"
                        />
                        {club.name}
                      </label>
                    ))}
                  </div>
                </div>
                <Button type="submit" disabled={isAddingEvent || eventClubIds.length === 0} className="w-full mt-2 bg-white text-black hover:bg-neutral-200 font-bold py-3 rounded-xl transition-all">
                  {isAddingEvent ? "Creating Event..." : "Host Event"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      {/* Events List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <PremiumLoader />
        </div>
      ) : (
        <div className="space-y-16">
          {/* Upcoming Events */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1.5 bg-pastel-blue rounded-full shadow-[0_0_10px_rgba(186,230,253,0.5)]" />
              <h2 className="text-2xl font-bold text-white tracking-tight">Upcoming Events</h2>
            </div>
            
            {events.filter(e => new Date(e.date) >= new Date()).length === 0 ? (
              <div className="text-center py-20 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl">
                <Calendar className="h-10 w-10 text-neutral-500 mx-auto mb-4" />
                <p className="text-neutral-400">No upcoming events found.</p>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
                initial="hidden"
                animate="show"
              >
                {events.filter(e => new Date(e.date) >= new Date()).map((event) => (
                  <motion.div key={event.id} variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                  }}>
                    <SpotlightCard className="h-full p-0">
                      <Link href={`/events/${event.id}`} className="group p-6 h-full transition-all duration-500 relative block cursor-pointer">
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
                    </SpotlightCard>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Past Events */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1.5 bg-neutral-600 rounded-full" />
              <h2 className="text-2xl font-bold text-neutral-300 tracking-tight">Past Events</h2>
            </div>
            
            {events.filter(e => new Date(e.date) < new Date()).length === 0 ? (
              <div className="text-center py-20 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl">
                <Calendar className="h-10 w-10 text-neutral-700 mx-auto mb-4" />
                <p className="text-neutral-500">No past events found.</p>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
                initial="hidden"
                animate="show"
              >
                {events.filter(e => new Date(e.date) < new Date()).map((event) => (
                  <motion.div key={event.id} variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                  }} className="opacity-70 hover:opacity-100 transition-opacity">
                    <SpotlightCard className="h-full p-0">
                      <Link href={`/events/${event.id}`} className="group p-6 h-full transition-all duration-500 relative block cursor-pointer grayscale hover:grayscale-0">
                        <div className="absolute top-0 right-0 p-8 w-32 h-32 bg-neutral-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-neutral-500/20 transition-colors" />
                        
                        <div className="relative z-10 flex flex-col h-full">
                          <div className="flex items-start justify-between mb-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-neutral-500/10 text-neutral-400 border border-neutral-500/20 max-w-[200px] truncate">
                              <Users className="h-3 w-3 shrink-0" /> <span className="truncate">{event.clubs?.map(c => c.name).join(', ')}</span>
                            </span>
                          </div>
                          
                          <h3 className="text-2xl font-bold text-neutral-300 mb-2 tracking-tight">{event.title}</h3>
                          <p className="text-sm text-neutral-500 mb-6 flex-1">{event.description}</p>
                          
                          <div className="space-y-3 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-3 text-sm text-neutral-400">
                              <Clock className="h-4 w-4 text-neutral-500" />
                              {formatDate(event.date)}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-neutral-400">
                              <MapPin className="h-4 w-4 text-neutral-500" />
                              {event.venue}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </SpotlightCard>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
