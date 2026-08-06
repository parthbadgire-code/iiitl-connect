"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { ShieldAlert, Plus, Calendar as CalendarIcon, MapPin, Clock, ArrowLeft, Users, ShieldCheck, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@parthbadgire/ui/components/card";
import { Button } from "@parthbadgire/ui/components/button";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";

type ClubDetails = {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  members: {
    role: "LEAD" | "CORE" | "COORDINATOR" | "SENIOR_MEMBER" | "MEMBER" | "VOLUNTEER";
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
    }
  }[];
  events: {
    id: string;
    title: string;
    date: string;
    venue: string;
  }[];
};

export default function ClubDetailsPage() {
  const { clubId } = useParams();
  const { data: session } = useSession();
  const [club, setClub] = useState<ClubDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Roster Management State
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState<"LEAD" | "CORE" | "COORDINATOR" | "SENIOR_MEMBER" | "MEMBER" | "VOLUNTEER">("MEMBER");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberError, setMemberError] = useState("");

  // Event Creation State
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventVenue, setEventVenue] = useState("");
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  // Transfer Role State
  const [transferEmail, setTransferEmail] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferError, setTransferError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const fetchClub = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/clubs/${clubId}`, { credentials: "include" });
      if (res.ok) setClub(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [clubId, API_URL]);

  useEffect(() => {
    fetchClub();
  }, [fetchClub]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingMember(true);
    setMemberError("");
    try {
      const res = await fetch(`${API_URL}/clubs/${clubId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: addEmail, role: addRole }),
      });
      if (res.ok) {
        setAddEmail("");
        fetchClub(); // Refresh roster
      } else {
        const errorData = await res.json();
        setMemberError(errorData.message || "Failed to add member.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleTransferRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTransferring(true);
    setTransferError("");
    try {
      const res = await fetch(`${API_URL}/clubs/${clubId}/transfer-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: transferEmail }),
      });
      if (res.ok) {
        setTransferEmail("");
        fetchClub();
      } else {
        const errorData = await res.json();
        setTransferError(errorData.message || "Failed to transfer role.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingEvent(true);
    try {
      const res = await fetch(`${API_URL}/events/${clubId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: eventTitle, date: new Date(eventDate).toISOString(), venue: eventVenue }),
      });
      if (res.ok) {
        setEventTitle("");
        setEventDate("");
        setEventVenue("");
        fetchClub();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingEvent(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-zinc-500">Loading Club Details...</div>;
  if (!club) return <div className="flex justify-center items-center h-64 text-red-400">Club not found.</div>;

  const myMembership = club.members.find(m => m.user.email === session?.user?.email);
  const isLead = myMembership?.role === "LEAD";
  const isCore = myMembership?.role === "CORE";
  const isCoordinator = myMembership?.role === "COORDINATOR";
  const isSeniorMember = myMembership?.role === "SENIOR_MEMBER";
  
  const canTransferRole = myMembership && !["MEMBER", "VOLUNTEER"].includes(myMembership.role);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <Link href="/clubs" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Clubs
      </Link>

      <div className="relative rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="h-40 bg-gradient-to-r from-amber-900/40 via-red-900/20 to-zinc-950 border-b border-zinc-800" />
        <div className="px-8 pb-8 pt-6 relative flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="absolute -top-16 left-8 h-28 w-28 rounded-2xl bg-zinc-900 border-4 border-zinc-950 flex items-center justify-center overflow-hidden shadow-xl">
            {club.logo ? (
              <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-black text-zinc-700">{club.name.charAt(0)}</span>
            )}
          </div>
          <div className="mt-12 md:mt-0 md:ml-32 flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-zinc-100">{club.name}</h1>
              {myMembership && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                  {myMembership.role}
                </span>
              )}
            </div>
            <p className="text-zinc-400">@{club.slug}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Roster & Details */}
        <div className="lg:col-span-2 space-y-8">
          
          <Card className="glass-card bg-zinc-950/80 border-zinc-800">
            <CardHeader>
              <CardTitle>About the Club</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-zinc-300 leading-relaxed">{club.description || "No description provided."}</p>
            </CardContent>
          </Card>

          <Card className="glass-card bg-zinc-950/80 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-amber-500" /> Club Roster</CardTitle>
              <span className="text-sm text-zinc-500 font-medium">{club.members.length} Members</span>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {club.members.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-900 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-zinc-800 overflow-hidden shrink-0">
                      {member.user.image ? <img src={member.user.image} alt={member.user.name} /> : <div className="h-full w-full flex items-center justify-center text-zinc-500 font-bold">{member.user.name[0]}</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-100 truncate">{member.user.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {member.role === "LEAD" && <ShieldCheck className="h-3 w-3 text-amber-500" />}
                        {member.role === "CORE" && <ShieldAlert className="h-3 w-3 text-blue-400" />}
                        {member.role === "COORDINATOR" && <ShieldCheck className="h-3 w-3 text-purple-400" />}
                        {member.role === "SENIOR_MEMBER" && <ShieldAlert className="h-3 w-3 text-green-400" />}
                        {member.role === "MEMBER" && <User className="h-3 w-3 text-zinc-500" />}
                        {member.role === "VOLUNTEER" && <User className="h-3 w-3 text-zinc-600" />}
                        <span className="text-[10px] font-semibold text-zinc-400">{member.role.replace("_", " ")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* EVENTS LIST */}
          <Card className="glass-card bg-zinc-950/80 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CalendarIcon className="h-5 w-5 text-red-500" /> Club Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {club.events.map(event => (
                  <div key={event.id} className="flex gap-4 p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/30">
                     <div className="flex flex-col items-center justify-center h-16 w-16 rounded-xl bg-red-500/10 border border-red-500/20 shrink-0 text-center">
                        <span className="text-xs font-bold text-red-500 uppercase leading-none mb-1">
                          {new Date(event.date).toLocaleString('default', { month: 'short' })}
                        </span>
                        <span className="text-2xl font-black text-red-400 leading-none">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="font-bold text-zinc-100">{event.title}</h4>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.venue}</span>
                        </div>
                      </div>
                  </div>
                ))}
                {club.events.length === 0 && <p className="text-zinc-500 text-sm">No events scheduled.</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Admin Tools */}
        <div className="space-y-6">
          {isLead && (
            <Card className="bg-amber-950/20 border-amber-900/50">
              <CardHeader className="pb-3 border-b border-amber-900/30">
                <CardTitle className="text-amber-500 flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Manage Roster</CardTitle>
                <CardDescription className="text-amber-500/70">Assign roles to students. This will grant them a verified profile badge.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-amber-500/80 uppercase">Student Email</label>
                    <input
                      required
                      type="email"
                      value={addEmail}
                      onChange={e => setAddEmail(e.target.value)}
                      placeholder="student@iiitl.ac.in"
                      className="w-full p-2.5 bg-black/40 border border-amber-900/50 rounded-lg text-sm text-zinc-100 focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-amber-500/80 uppercase">Assign Role</label>
                    <select
                      value={addRole}
                      onChange={e => setAddRole(e.target.value as "LEAD" | "CORE" | "COORDINATOR" | "SENIOR_MEMBER" | "MEMBER" | "VOLUNTEER")}
                      className="w-full p-2.5 bg-black/40 border border-amber-900/50 rounded-lg text-sm text-zinc-100 focus:border-amber-500 outline-none appearance-none"
                    >
                      <option value="VOLUNTEER">Volunteer</option>
                      <option value="MEMBER">Member</option>
                      <option value="SENIOR_MEMBER">Senior Member</option>
                      <option value="COORDINATOR">Coordinator</option>
                      <option value="CORE">Core Team</option>
                      <option value="LEAD">Lead</option>
                    </select>
                  </div>
                  {memberError && <p className="text-xs text-red-400 font-medium">{memberError}</p>}
                  <Button type="submit" disabled={isAddingMember} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                    {isAddingMember ? "Adding..." : "Add to Roster"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {(isLead || isCore || isCoordinator || isSeniorMember) && (
            <Card className="bg-red-950/20 border-red-900/50">
              <CardHeader className="pb-3 border-b border-red-900/30">
                <CardTitle className="text-red-400 flex items-center gap-2"><CalendarIcon className="h-5 w-5" /> Host Event</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-red-400/80 uppercase">Event Title</label>
                    <input
                      required
                      value={eventTitle}
                      onChange={e => setEventTitle(e.target.value)}
                      placeholder="e.g. Hacktoberfest Sync"
                      className="w-full p-2.5 bg-black/40 border border-red-900/50 rounded-lg text-sm text-zinc-100 focus:border-red-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-red-400/80 uppercase">Date & Time</label>
                    <input
                      required
                      type="datetime-local"
                      value={eventDate}
                      onChange={e => setEventDate(e.target.value)}
                      className="w-full p-2.5 bg-black/40 border border-red-900/50 rounded-lg text-sm text-zinc-100 focus:border-red-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-red-400/80 uppercase">Venue</label>
                    <input
                      required
                      value={eventVenue}
                      onChange={e => setEventVenue(e.target.value)}
                      placeholder="e.g. LT-1"
                      className="w-full p-2.5 bg-black/40 border border-red-900/50 rounded-lg text-sm text-zinc-100 focus:border-red-500 outline-none"
                    />
                  </div>
                  <Button type="submit" disabled={isAddingEvent} className="w-full bg-red-600 hover:bg-red-700 text-white gap-2">
                    <Plus className="h-4 w-4" /> {isAddingEvent ? "Creating..." : "Create Event"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {canTransferRole && (
            <Card className="bg-purple-950/20 border-purple-900/50">
              <CardHeader className="pb-3 border-b border-purple-900/30">
                <CardTitle className="text-purple-400 flex items-center gap-2"><ShieldAlert className="h-5 w-5" /> Transfer Role</CardTitle>
                <CardDescription className="text-purple-400/70">Pass down your current position ({myMembership?.role.replace("_", " ")}) to another student. You will become a Senior Member.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form onSubmit={handleTransferRole} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-purple-400/80 uppercase">Student Email</label>
                    <input
                      required
                      type="email"
                      value={transferEmail}
                      onChange={e => setTransferEmail(e.target.value)}
                      placeholder="student@iiitl.ac.in"
                      className="w-full p-2.5 bg-black/40 border border-purple-900/50 rounded-lg text-sm text-zinc-100 focus:border-purple-500 outline-none"
                    />
                  </div>
                  {transferError && <p className="text-xs text-red-400 font-medium">{transferError}</p>}
                  <Button type="submit" disabled={isTransferring} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    {isTransferring ? "Transferring..." : "Transfer Position"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
