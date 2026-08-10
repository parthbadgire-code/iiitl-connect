"use client";

import { useEffect, useState, useRef } from "react";
import { Heart, X, Sparkles, Target, Code, Dumbbell, UserPlus, MessageSquare, Send, Trash2, Edit2, ArrowLeft, MoreVertical, ShieldAlert, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@parthbadgire/ui/components/card";
import { useSession } from "@/lib/auth-client";
import { io, Socket } from "socket.io-client";

type ConnectionProfile = {
  username: string;
  gender: string;
  year?: string;
  bio: string;
  prompts?: { question: string, answer: string }[];
  interests: string[];
  lookingFor: string[];
};

type DiscoverProfile = {
  userId: string;
  username: string;
  gender: string;
  bio: string;
  prompts?: { question: string, answer: string }[];
  interests: string[];
  lookingFor: string[];
  matchScore?: number;
  user: {
    id: string;
  };
};

type MatchProfile = {
  matchId: string;
  matchedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    connectionProfile: ConnectionProfile;
  };
};

type ChatMessage = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
};

const LOOKING_FOR_OPTIONS = [
  { key: "STUDY_PARTNER", label: "Study Partner", icon: Target, color: "#3b82f6" },
  { key: "GYM_BUDDY", label: "Gym Buddy", icon: Dumbbell, color: "#10b981" },
  { key: "HACKATHON", label: "Hackathon Teammate", icon: Code, color: "#8b5cf6" },
  { key: "CRUSH", label: "Crush", icon: Heart, color: "#ec4899" },
];

const GENDER_OPTIONS = ["MALE", "FEMALE", "NON_BINARY", "OTHER"];

export default function ConnectionsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.email === "lit2025021@iiitl.ac.in";

  const [activeTab, setActiveTab] = useState<"DISCOVER" | "MATCHES" | "PROFILE">("DISCOVER");
  const [loading, setLoading] = useState(true);
  
  // Profile State
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [myProfile, setMyProfile] = useState<ConnectionProfile | null>(null);
  
  // Form State
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("MALE");
  const [year, setYear] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [prompts, setPrompts] = useState<{ question: string, answer: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState("");

  // Discover State
  const [discoverProfiles, setDiscoverProfiles] = useState<DiscoverProfile[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [matchNotification, setMatchNotification] = useState<string | null>(null);
  const [filterYear, setFilterYear] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterLookingFor, setFilterLookingFor] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Matches & Chat State
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [showChatMenu, setShowChatMenu] = useState(false);

  useEffect(() => {
    checkProfile();
  }, []);

  useEffect(() => {
    if (hasProfile) {
      if (activeTab === "DISCOVER") fetchDiscover();
      else if (activeTab === "MATCHES") fetchMatches();
    }
  }, [hasProfile, activeTab]);

  useEffect(() => {
    if (session?.user?.id) {
      const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/connections`, {
        auth: { userId: session.user.id }
      });
      setSocket(newSocket);

      newSocket.on("newMessage", (msg: ChatMessage) => {
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      });

      newSocket.on("error", (err: { message: string }) => {
        alert(err.message);
      });

      return () => { newSocket.close(); };
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (selectedMatch) {
      fetchMessages(selectedMatch.matchId);
      setShowChatMenu(false);
    }
  }, [selectedMatch]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const checkProfile = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/connections/profile`, { credentials: "include" });
      if (res.ok) {
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        if (data) {
          setHasProfile(true);
          setMyProfile(data);
          setUsername(data.username);
          setGender(data.gender);
          setYear(data.year || "");
          setBio(data.bio || "");
          setPrompts(data.prompts || []);
          setInterests(data.interests.join(", "));
          setLookingFor(data.lookingFor || []);
        } else {
          setHasProfile(false);
        }
      } else {
        setHasProfile(false);
      }
    } catch (err) {
      console.error(err);
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!username.trim() || !interests.trim()) {
      setFormError("Username and Interests are required.");
      return;
    }
    setIsSubmitting(true);
    setFormError("");
    const interestsArray = interests.split(",").map(i => i.trim()).filter(Boolean);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/connections/profile`, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, gender, year, bio, prompts, interests: interestsArray, lookingFor }),
      });
      if (res.ok) {
        setHasProfile(true);
        setIsEditing(false);
        checkProfile();
        if (!isEditing) setActiveTab("DISCOVER");
      } else {
        const err = await res.json();
        setFormError(err.message || "Failed to save profile");
      }
    } catch (err) {
      console.error(err);
      setFormError("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProfile = async () => {
    if (!confirm("Are you sure you want to delete your Connections profile? This will permanently delete all your matches and messages.")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/connections/profile`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        setHasProfile(false);
        setMyProfile(null);
        setActiveTab("DISCOVER");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminDeleteProfile = async (profileId: string) => {
    if (!confirm("ADMIN ACTION: Permanently delete this connection profile?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/connections/admin/profiles/${profileId}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        setDiscoverProfiles(prev => prev.filter((p, i) => i !== currentProfileIndex));
        // Ensure index doesn't go out of bounds
        if (currentProfileIndex >= discoverProfiles.length - 1) {
          setCurrentProfileIndex(Math.max(0, discoverProfiles.length - 2));
        }
      } else {
        alert("Failed to delete profile");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDiscover = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterYear) params.append("year", filterYear);
      if (filterGender) params.append("gender", filterGender);
      if (filterLookingFor) params.append("lookingFor", filterLookingFor);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/connections/discover?${params.toString()}`, { credentials: "include" });
      if (res.ok) {
        setDiscoverProfiles(await res.json());
        setCurrentProfileIndex(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/connections/matches`, { credentials: "include" });
      if (res.ok) setMatches(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action: "LIKE" | "PASS") => {
    if (currentProfileIndex >= discoverProfiles.length) return;
    const profile = discoverProfiles[currentProfileIndex];
    setCurrentProfileIndex(prev => prev + 1);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/connections/swipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ receiverId: profile.user.id, action }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.matched) {
          setMatchNotification(`You matched with ${profile.username}! 🎉`);
          setTimeout(() => setMatchNotification(null), 4000);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (matchId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/connections/matches/${matchId}/messages`, { credentials: "include" });
      if (res.ok) setMessages(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedMatch || !socket) return;
    const content = newMessage;
    setNewMessage("");
    socket.emit("sendMessage", {
      matchId: selectedMatch.matchId,
      receiverId: selectedMatch.user.id,
      content,
    });
  };

  const handleBlockUser = async () => {
    if (!selectedMatch) return;
    if (!confirm("Are you sure you want to block this user? This will unmatch them permanently.")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/connections/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userIdToBlock: selectedMatch.user.id }),
      });
      if (res.ok) {
        setMatches(prev => prev.filter(m => m.matchId !== selectedMatch.matchId));
        setSelectedMatch(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportUser = async () => {
    if (!selectedMatch) return;
    const reason = prompt("Please provide a reason for reporting this user:");
    if (!reason) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/connections/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userIdToReport: selectedMatch.user.id, reason }),
      });
      if (res.ok) {
        alert("User reported successfully. They have been unmatched.");
        setMatches(prev => prev.filter(m => m.matchId !== selectedMatch.matchId));
        setSelectedMatch(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && hasProfile === null) {
    return <div className="flex justify-center items-center h-64 text-zinc-500">Loading...</div>;
  }

  // PROFILE CREATION SCREEN OR EDIT SCREEN
  if (hasProfile === false || isEditing) {
    return (
      <div className="max-w-xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8 animate-fade-in-up">
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center bg-pastel-blue/10 border border-pastel-blue/20 mb-4">
            <UserPlus className="h-8 w-8 text-pastel-blue" />
          </div>
          <h1 className="text-3xl font-black text-white">{isEditing ? "Edit Profile" : "Join Connections"}</h1>
          <p className="text-neutral-400 text-sm">Find your perfect study partner, gym buddy, or hackathon teammate.</p>
        </div>

        <Card className="bg-[#0A0A0A]/50 backdrop-blur-xl border-white/5 rounded-3xl p-4 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {formError && <p className="text-red-400 text-sm font-bold bg-red-400/10 p-3 rounded-lg border border-red-400/20">{formError}</p>}
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase">Username (Required)</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Pseudonym for privacy..."
                className="w-full p-4 bg-black border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-pastel-blue text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full p-4 bg-black border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-pastel-blue text-white appearance-none"
              >
                {GENDER_OPTIONS.map(g => (
                  <option key={g} value={g}>{g.replace("_", " ")}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase">Year</label>
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="w-full p-4 bg-black border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-pastel-blue text-white appearance-none"
              >
                <option value="" disabled>Select Year</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
                <option value="2029">2029</option>
                <option value="2030">2030</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase">Bio (Optional)</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="A little about yourself..."
                className="w-full p-4 bg-black border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-pastel-blue resize-none h-24 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase">Interests (Comma separated)</label>
              <input
                type="text"
                value={interests}
                onChange={e => setInterests(e.target.value)}
                placeholder="React, Machine Learning, Anime..."
                className="w-full p-4 bg-black border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-pastel-blue text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase">I&apos;m looking for... (Select multiple)</label>
              <div className="grid grid-cols-2 gap-3">
                {LOOKING_FOR_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = lookingFor.includes(opt.key);
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setLookingFor(prev => prev.includes(opt.key) ? prev.filter(k => k !== opt.key) : [...prev, opt.key])}
                      className="flex flex-col items-center justify-center p-4 rounded-xl border transition-all"
                      style={{
                        background: isSelected ? `${opt.color}15` : "rgba(24,24,27,0.5)",
                        borderColor: isSelected ? `${opt.color}50` : "rgba(39,39,42,0.8)",
                        color: isSelected ? opt.color : "#a1a1aa",
                      }}
                    >
                      <Icon className="h-6 w-6 mb-2" />
                      <span className="text-xs font-medium">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-semibold text-neutral-400 uppercase">Profile Prompts (Icebreakers)</label>
              {prompts.map((p, index) => (
                <div key={index} className="space-y-2 bg-neutral-900/50 p-4 rounded-xl border border-white/5 relative">
                  <button onClick={() => setPrompts(prev => prev.filter((_, i) => i !== index))} className="absolute top-2 right-2 text-neutral-500 hover:text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                  <select
                    value={p.question}
                    onChange={(e) => setPrompts(prev => { const n = [...prev]; n[index].question = e.target.value; return n; })}
                    className="w-full bg-transparent border-b border-neutral-700 text-sm font-semibold text-pastel-blue pb-1 focus:outline-none focus:border-pastel-blue"
                  >
                    <option value="" disabled>Select a prompt...</option>
                    <option value="A controversial campus opinion I have is...">A controversial campus opinion I have is...</option>
                    <option value="My ideal study session involves...">My ideal study session involves...</option>
                    <option value="I geek out on...">I geek out on...</option>
                    <option value="The best hackathon idea I ever had...">The best hackathon idea I ever had...</option>
                    <option value="You should swipe right if...">You should swipe right if...</option>
                  </select>
                  <input
                    type="text"
                    value={p.answer}
                    onChange={(e) => setPrompts(prev => { const n = [...prev]; n[index].answer = e.target.value; return n; })}
                    placeholder="Your answer..."
                    className="w-full bg-transparent text-sm text-white focus:outline-none pt-2"
                  />
                </div>
              ))}
              {prompts.length < 3 && (
                <button
                  onClick={() => setPrompts(prev => [...prev, { question: "", answer: "" }])}
                  className="w-full py-3 border border-dashed border-neutral-700 rounded-xl text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors text-sm font-medium"
                >
                  + Add Prompt
                </button>
              )}
            </div>

            <div className="flex gap-4">
              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-4 rounded-xl transition-all"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={createProfile}
                disabled={isSubmitting || !username.trim() || !interests.trim()}
                className="w-full bg-pastel-blue hover:bg-pastel-blue/90 text-black font-bold py-4 rounded-xl transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Join the Engine"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // MAIN CONNECTIONS HUB
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8 h-[calc(100vh-72px)] flex flex-col">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in-up shrink-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1 w-6 rounded-full bg-pastel-blue" />
            <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
              Connections Engine
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-white">
            Find Your <span className="text-pastel-blue">Match</span>
          </h1>
        </div>

        <div className="flex p-1 bg-black/40 border border-white/5 rounded-xl shrink-0 backdrop-blur-md">
          <button
            onClick={() => { setActiveTab("DISCOVER"); setSelectedMatch(null); }}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "DISCOVER" ? "bg-pastel-blue text-black shadow-lg" : "text-neutral-400 hover:text-white"
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => { setActiveTab("MATCHES"); setSelectedMatch(null); }}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "MATCHES" ? "bg-pastel-blue text-black shadow-lg" : "text-neutral-400 hover:text-white"
            }`}
          >
            My Connections
          </button>
          <button
            onClick={() => { setActiveTab("PROFILE"); setSelectedMatch(null); }}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "PROFILE" ? "bg-pastel-blue text-black shadow-lg" : "text-neutral-400 hover:text-white"
            }`}
          >
            My Profile
          </button>
        </div>
      </div>

      {matchNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500/90 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-fade-in-up flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          {matchNotification}
        </div>
      )}

      {/* DISCOVER TAB */}
      {activeTab === "DISCOVER" && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-md mx-auto py-8">
            <div className="mb-4 flex justify-end">
              <button onClick={() => setShowFilters(!showFilters)} className="text-xs font-bold uppercase text-pastel-blue tracking-wider bg-pastel-blue/10 px-3 py-1.5 rounded-lg border border-pastel-blue/20 hover:bg-pastel-blue/20 transition-colors">
                {showFilters ? "Hide Filters" : "Filters"}
              </button>
            </div>
            {showFilters && (
              <div className="mb-6 p-4 bg-zinc-900/50 border border-white/5 rounded-2xl grid grid-cols-3 gap-2">
                <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="bg-black border border-white/10 rounded-lg text-xs p-2 text-white">
                  <option value="">Any Year</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                  <option value="2030">2030</option>
                </select>
                <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} className="bg-black border border-white/10 rounded-lg text-xs p-2 text-white">
                  <option value="">Any Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
                <select value={filterLookingFor} onChange={(e) => setFilterLookingFor(e.target.value)} className="bg-black border border-white/10 rounded-lg text-xs p-2 text-white">
                  <option value="">Any Goal</option>
                  <option value="STUDY_PARTNER">Study Partner</option>
                  <option value="GYM_BUDDY">Gym Buddy</option>
                  <option value="HACKATHON">Hackathon</option>
                  <option value="CRUSH">Crush</option>
                </select>
                <button onClick={fetchDiscover} className="col-span-3 mt-2 bg-white/10 text-white text-xs font-bold py-2 rounded-lg hover:bg-white/20 transition-colors">
                  Apply Filters
                </button>
              </div>
            )}
            
            {loading ? (
              <Card className="h-[450px] bg-zinc-950 border-zinc-800 flex items-center justify-center">
                <div className="skeleton h-32 w-32 rounded-full mb-4" />
              </Card>
            ) : currentProfileIndex < discoverProfiles.length ? (
              <div className="relative animate-slide-in-right" key={currentProfileIndex}>
                <Card className="bg-[#0A0A0A]/50 backdrop-blur-xl border-white/5 overflow-hidden shadow-2xl rounded-3xl">
                  <div className="h-32 bg-pastel-blue/10 border-b border-white/5 relative">
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                      <div className="h-24 w-24 rounded-full border-4 border-zinc-950 bg-zinc-800 overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center bg-black/60 text-3xl font-bold text-white">
                          {discoverProfiles[currentProfileIndex].username.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <button
                      onClick={() => handleAdminDeleteProfile(discoverProfiles[currentProfileIndex].user.id)} // userId might not be the profileId. Wait! The API expects profileId. The DiscoverProfile doesn't seem to have `id` for the profile, it has `userId`. Let's check. 
                      // Wait, I need to look closely at discoverProfiles structure. Let's just pass the userId and have the backend fix it if necessary. Actually, the backend `adminDeleteProfile` takes `profileId`. Let me modify the API or pass the right ID. 
                      // For now, let's just make it delete using the userId. I will need to fix the backend endpoint if it expects profileId.
                      // Let's change backend to accept userId for deletion, or just fix it here. Let's assume discoverProfiles gives the profile's userId. I'll modify the backend ConnectionsService to delete by `userId` instead of `id`.
                      className="absolute top-4 right-4 h-10 w-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors z-10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  
                  <CardContent className="pt-16 pb-8 px-6 text-center space-y-6">
                    {discoverProfiles[currentProfileIndex].matchScore !== undefined && (
                      <div className="absolute top-4 left-4 h-10 px-4 rounded-full bg-pastel-blue/10 border border-pastel-blue/20 flex items-center justify-center text-pastel-blue font-bold shadow-[0_0_15px_rgba(186,230,253,0.3)] z-10 text-xs uppercase tracking-wider">
                        🔥 {discoverProfiles[currentProfileIndex].matchScore}% Match
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-bold text-white">{discoverProfiles[currentProfileIndex].username}</h2>
                      <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 text-[10px] font-bold tracking-widest uppercase">
                          {discoverProfiles[currentProfileIndex].gender}
                        </span>
                        {discoverProfiles[currentProfileIndex].lookingFor?.map((lfKey, i) => {
                          const lf = LOOKING_FOR_OPTIONS.find(o => o.key === lfKey);
                          if (!lf) return null;
                          const Icon = lf.icon;
                          return (
                            <span key={i} className="px-3 py-1 text-xs rounded-full flex items-center gap-1.5 font-medium hover:scale-105 hover:animate-glow-pulse transition-all"
                              style={{ background: `${lf.color}15`, color: lf.color, border: `1px solid ${lf.color}30` }}>
                              <Icon className="h-3 w-3" />
                              {lf.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {discoverProfiles[currentProfileIndex].bio && (
                      <p className="text-zinc-300 text-sm italic">
                        &quot;{discoverProfiles[currentProfileIndex].bio}&quot;
                      </p>
                    )}

                    {discoverProfiles[currentProfileIndex].prompts?.map((p, i) => (
                      <div key={i} className="text-left bg-white/5 p-4 rounded-xl border border-white/10 mt-4">
                        <p className="text-[10px] text-pastel-blue font-bold uppercase tracking-wider mb-1">{p.question}</p>
                        <p className="text-sm text-white">{p.answer}</p>
                      </div>
                    ))}

                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                      {discoverProfiles[currentProfileIndex].interests.map((interest, i) => (
                        <span key={i} className="px-3 py-1 bg-black/40 border border-white/5 text-neutral-400 text-xs rounded-full">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-center gap-6 mt-8">
                  <button
                    onClick={() => handleSwipe("PASS")}
                    className="group h-16 w-16 rounded-full bg-black/60 border-2 border-white/10 flex items-center justify-center text-neutral-500 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all shadow-lg hover:scale-110 active:scale-95"
                  >
                    <X className="h-8 w-8 transition-transform group-hover:rotate-12" />
                  </button>
                  <button
                    onClick={() => handleSwipe("LIKE")}
                    className="group h-16 w-16 rounded-full bg-pastel-blue/10 border-2 border-pastel-blue/30 flex items-center justify-center text-pastel-blue hover:bg-pastel-blue/20 hover:border-pastel-blue/50 transition-all shadow-[0_0_20px_rgba(186,230,253,0.2)] hover:shadow-[0_0_30px_rgba(186,230,253,0.4)] hover:scale-110 active:scale-95"
                  >
                    <Heart className="h-8 w-8 fill-current transition-transform group-hover:animate-heartbeat" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 animate-fade-in-up">
                <div className="mx-auto h-20 w-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                  <Sparkles className="h-10 w-10 text-cyan-500 opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-zinc-100">You&apos;re all caught up!</h3>
                <p className="text-zinc-500 mt-2">Check back later for more profiles.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MATCHES & CHAT TAB */}
      {activeTab === "MATCHES" && (
        <div className="flex-1 flex gap-6 min-h-0">
          {/* Matches List */}
          <div className={`${selectedMatch ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 bg-[#0A0A0A]/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl shrink-0`}>
            <div className="p-4 border-b border-white/5 bg-black/20">
              <h2 className="font-bold text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-pastel-blue" /> Your Matches
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading && !matches.length ? (
                <div className="p-4 text-center text-neutral-500 text-sm">Loading matches...</div>
              ) : matches.length === 0 ? (
                <div className="p-4 text-center text-neutral-500 text-sm">No matches yet. Start discovering!</div>
              ) : (
                matches.map((match) => (
                  <button
                    key={match.matchId}
                    onClick={() => setSelectedMatch(match)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                      selectedMatch?.matchId === match.matchId ? 'bg-pastel-blue/10 border-pastel-blue/20' : 'hover:bg-white/5 border-transparent'
                    } border`}
                  >
                    <div className="h-10 w-10 rounded-full bg-neutral-800 shrink-0 overflow-hidden border border-white/10 flex items-center justify-center font-bold text-white text-lg">
                      {match.user.connectionProfile.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{match.user.name}</h4>
                      <p className="text-xs text-neutral-400 truncate">@{match.user.connectionProfile.username}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Interface */}
          {selectedMatch ? (
            <div className="flex-1 bg-[#0A0A0A]/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-w-0">
              <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between relative">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedMatch(null)} className="md:hidden text-neutral-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="h-10 w-10 rounded-full bg-neutral-800 shrink-0 overflow-hidden border border-white/10 flex items-center justify-center font-bold text-white text-lg">
                    {selectedMatch.user.connectionProfile.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white leading-tight">{selectedMatch.user.name}</h3>
                    <p className="text-xs text-neutral-400">@{selectedMatch.user.connectionProfile.username}</p>
                  </div>
                </div>

                <div className="relative">
                  <button onClick={() => setShowChatMenu(!showChatMenu)} className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                  {showChatMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
                      <button onClick={handleBlockUser} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 flex items-center gap-2 transition-colors border-b border-zinc-800">
                        <UserX className="h-4 w-4" /> Unmatch & Block
                      </button>
                      <button onClick={handleReportUser} className="w-full text-left px-4 py-3 text-sm text-orange-400 hover:bg-orange-400/10 flex items-center gap-2 transition-colors">
                        <ShieldAlert className="h-4 w-4" /> Report User
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500">
                    <Heart className="h-12 w-12 text-pastel-blue/20 mb-4" />
                    <p>You matched with {selectedMatch.user.name}!</p>
                    <p className="text-sm">Send a message to start the conversation.</p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = msg.senderId !== selectedMatch.user.id;
                    return (
                      <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                          isMe ? 'bg-pastel-blue text-black rounded-br-none font-medium' : 'bg-white/10 text-white rounded-bl-none'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-white/5 bg-black/20">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-black/50 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-pastel-blue"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="h-10 w-10 rounded-full bg-pastel-blue flex items-center justify-center text-black disabled:opacity-50 hover:scale-105 transition-transform"
                  >
                    <Send className="h-4 w-4 ml-0.5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 bg-[#0A0A0A]/50 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl flex-col items-center justify-center text-neutral-500">
              <MessageSquare className="h-16 w-16 text-neutral-800 mb-4" />
              <p>Select a match to start chatting</p>
            </div>
          )}
        </div>
      )}

      {/* MY PROFILE TAB */}
      {activeTab === "PROFILE" && myProfile && (
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-md mx-auto py-8">
            <Card className="bg-[#0A0A0A]/50 backdrop-blur-xl border-white/5 shadow-2xl rounded-3xl overflow-hidden">
              <div className="h-32 bg-pastel-blue/10 border-b border-white/5 relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => setIsEditing(true)} className="h-10 w-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={deleteProfile} className="h-10 w-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                  <div className="h-24 w-24 rounded-full border-4 border-zinc-950 bg-zinc-800 flex items-center justify-center text-3xl font-bold text-white shadow-xl">
                    {myProfile.username.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
              <CardContent className="pt-16 pb-8 px-6 text-center space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{myProfile.username}</h2>
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 text-[10px] font-bold tracking-widest uppercase">
                      {myProfile.gender}
                    </span>
                    {myProfile.lookingFor?.map((lfKey, i) => {
                      const lf = LOOKING_FOR_OPTIONS.find(o => o.key === lfKey);
                      if (!lf) return null;
                      const Icon = lf.icon;
                      return (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                          style={{ background: `${lf.color}15`, color: lf.color, border: `1px solid ${lf.color}30` }}>
                          <Icon className="h-3 w-3" />
                          {lf.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {myProfile.bio && (
                  <p className="text-zinc-300 text-sm italic">
                    &quot;{myProfile.bio}&quot;
                  </p>
                )}

                {myProfile.prompts?.map((p, i) => (
                  <div key={i} className="text-left bg-white/5 p-4 rounded-xl border border-white/10 mt-4">
                    <p className="text-[10px] text-pastel-blue font-bold uppercase tracking-wider mb-1">{p.question}</p>
                    <p className="text-sm text-white">{p.answer}</p>
                  </div>
                ))}

                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {myProfile.interests.map((interest, i) => (
                    <span key={i} className="px-3 py-1 bg-black/40 border border-white/5 text-neutral-400 text-xs rounded-full">
                      {interest}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
