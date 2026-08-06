"use client";

import { useEffect, useState } from "react";
import { Users, Heart, X, Sparkles, Target, Code, Dumbbell, UserPlus, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@parthbadgire/ui/components/card";

type ConnectionProfile = {
  bio: string;
  interests: string[];
  lookingFor: string;
};

type DiscoverProfile = {
  userId: string;
  bio: string;
  interests: string[];
  lookingFor: string;
  user: {
    id: string;
    name: string;
    image: string;
  };
};

type MatchProfile = {
  matchId: string;
  matchedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
    connectionProfile: ConnectionProfile;
  };
};

const LOOKING_FOR_OPTIONS = [
  { key: "STUDY_PARTNER", label: "Study Partner", icon: Target, color: "#3b82f6" },
  { key: "GYM_BUDDY", label: "Gym Buddy", icon: Dumbbell, color: "#10b981" },
  { key: "HACKATHON", label: "Hackathon Teammate", icon: Code, color: "#8b5cf6" },
  { key: "CRUSH", label: "Crush", icon: Heart, color: "#ec4899" },
];

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState<"DISCOVER" | "MATCHES">("DISCOVER");
  const [loading, setLoading] = useState(true);
  
  // Profile State
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState("");
  const [lookingFor, setLookingFor] = useState("STUDY_PARTNER");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Discover State
  const [discoverProfiles, setDiscoverProfiles] = useState<DiscoverProfile[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [matchNotification, setMatchNotification] = useState<string | null>(null);

  // Matches State
  const [matches, setMatches] = useState<MatchProfile[]>([]);

  useEffect(() => {
    checkProfile();
  }, []);

  useEffect(() => {
    if (hasProfile) {
      if (activeTab === "DISCOVER") fetchDiscover();
      else fetchMatches();
    }
  }, [hasProfile, activeTab]);

  const checkProfile = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/connections/profile`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setHasProfile(!!data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!interests.trim()) return;
    setIsSubmitting(true);
    const interestsArray = interests.split(",").map(i => i.trim()).filter(Boolean);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/connections/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bio, interests: interestsArray, lookingFor }),
      });
      if (res.ok) setHasProfile(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchDiscover = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/connections/discover`, { credentials: "include" });
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
    
    // Optimistically advance
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
          setMatchNotification(`You matched with ${profile.user.name}! 🎉`);
          setTimeout(() => setMatchNotification(null), 4000);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && hasProfile === null) {
    return <div className="flex justify-center items-center h-64 text-zinc-500">Loading...</div>;
  }

  // PROFILE CREATION SCREEN
  if (hasProfile === false) {
    return (
      <div className="max-w-xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8 animate-fade-in-up">
        <div className="text-center space-y-2">
          <div className="mx-auto h-16 w-16 rounded-full flex items-center justify-center bg-pastel-blue/10 border border-pastel-blue/20 mb-4">
            <UserPlus className="h-8 w-8 text-pastel-blue" />
          </div>
          <h1 className="text-3xl font-black text-white">Join Connections</h1>
          <p className="text-neutral-400 text-sm">Find your perfect study partner, gym buddy, or hackathon teammate.</p>
        </div>

        <Card className="bg-[#0A0A0A]/50 backdrop-blur-xl border-white/5 rounded-3xl p-4 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white">Create your profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
                placeholder="React, Machine Learning, Anime, Calisthenics..."
                className="w-full p-4 bg-black border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-pastel-blue text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase">I&apos;m looking for a...</label>
              <div className="grid grid-cols-2 gap-3">
                {LOOKING_FOR_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setLookingFor(opt.key)}
                      className="flex flex-col items-center justify-center p-4 rounded-xl border transition-all"
                      style={{
                        background: lookingFor === opt.key ? `${opt.color}15` : "rgba(24,24,27,0.5)",
                        borderColor: lookingFor === opt.key ? `${opt.color}50` : "rgba(39,39,42,0.8)",
                        color: lookingFor === opt.key ? opt.color : "#a1a1aa",
                      }}
                    >
                      <Icon className="h-6 w-6 mb-2" />
                      <span className="text-xs font-medium">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={createProfile}
              disabled={isSubmitting || !interests.trim()}
              className="w-full bg-pastel-blue hover:bg-pastel-blue/90 text-black font-bold py-4 rounded-xl transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Creating Profile..." : "Join the Engine"}
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // MAIN CONNECTIONS HUB
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in-up">
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
            onClick={() => setActiveTab("DISCOVER")}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "DISCOVER" ? "bg-pastel-blue text-black shadow-lg" : "text-neutral-400 hover:text-white"
            }`}
          >
            Discover
          </button>
          <button
            onClick={() => setActiveTab("MATCHES")}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === "MATCHES" ? "bg-pastel-blue text-black shadow-lg" : "text-neutral-400 hover:text-white"
            }`}
          >
            My Connections
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
        <div className="max-w-md mx-auto py-8">
          {loading ? (
            <Card className="h-[450px] bg-zinc-950 border-zinc-800 flex items-center justify-center">
              <div className="skeleton h-32 w-32 rounded-full mb-4" />
            </Card>
          ) : currentProfileIndex < discoverProfiles.length ? (
            <div className="relative animate-fade-in-up">
              <Card className="bg-[#0A0A0A]/50 backdrop-blur-xl border-white/5 overflow-hidden shadow-2xl rounded-3xl">
                <div className="h-32 bg-pastel-blue/10 border-b border-white/5 relative">
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                    <div className="h-24 w-24 rounded-full border-4 border-zinc-950 bg-zinc-800 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {discoverProfiles[currentProfileIndex].user.image ? (
                        <img src={discoverProfiles[currentProfileIndex].user.image} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-black/60 text-3xl font-bold text-white">
                          {discoverProfiles[currentProfileIndex].user.name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <CardContent className="pt-16 pb-8 px-6 text-center space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{discoverProfiles[currentProfileIndex].user.name}</h2>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      {(() => {
                        const lf = LOOKING_FOR_OPTIONS.find(o => o.key === discoverProfiles[currentProfileIndex].lookingFor);
                        const Icon = lf?.icon || Target;
                        return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                            style={{ background: `${lf?.color || '#fff'}15`, color: lf?.color, border: `1px solid ${lf?.color || '#fff'}30` }}>
                            <Icon className="h-3 w-3" />
                            Looking for {lf?.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {discoverProfiles[currentProfileIndex].bio && (
                    <p className="text-zinc-300 text-sm italic">
                      &quot;{discoverProfiles[currentProfileIndex].bio}&quot;
                    </p>
                  )}

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
                  className="h-16 w-16 rounded-full bg-black/60 border-2 border-white/10 flex items-center justify-center text-neutral-500 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all shadow-lg hover:scale-105 active:scale-95"
                >
                  <X className="h-8 w-8" />
                </button>
                <button
                  onClick={() => handleSwipe("LIKE")}
                  className="h-16 w-16 rounded-full bg-pastel-blue/10 border-2 border-pastel-blue/30 flex items-center justify-center text-pastel-blue hover:bg-pastel-blue/20 hover:border-pastel-blue/50 transition-all shadow-[0_0_20px_rgba(186,230,253,0.2)] hover:shadow-[0_0_30px_rgba(186,230,253,0.4)] hover:scale-105 active:scale-95"
                >
                  <Heart className="h-8 w-8 fill-current" />
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
      )}

      {/* MATCHES TAB */}
      {activeTab === "MATCHES" && (
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="h-48 bg-zinc-950 border-zinc-800" />
              ))}
            </div>
          ) : matches.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
              {matches.map((match, i) => {
                return (
                  <Card key={match.matchId} className="bg-[#0A0A0A]/50 backdrop-blur-xl border border-white/5 flex flex-col rounded-3xl shadow-2xl hover:border-white/20 transition-all" style={{ animationDelay: `${i * 50}ms` }}>
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full border-2 border-green-500/50 overflow-hidden bg-zinc-800 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {match.user.image ? (
                            <img src={match.user.image} alt={match.user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-zinc-400">
                              {match.user.name?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <CardTitle className="text-base font-bold text-zinc-100 truncate">
                            {match.user.name}
                          </CardTitle>
                          <div className="flex items-center gap-1 text-xs text-green-400 font-medium mt-0.5">
                            <CheckCircle2 className="h-3 w-3" />
                            Matched
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        {match.user.connectionProfile && (
                          <div className="flex flex-wrap gap-1">
                            {match.user.connectionProfile.interests.slice(0, 3).map((interest, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] rounded-md">
                                {interest}
                              </span>
                            ))}
                            {match.user.connectionProfile.interests.length > 3 && (
                              <span className="px-2 py-0.5 bg-zinc-900 text-zinc-500 text-[10px] rounded-md">
                                +{match.user.connectionProfile.interests.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="pt-4 border-t border-white/5">
                          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Reach Out</p>
                          <a 
                            href={`mailto:${match.user.email}`}
                            className="block w-full text-center py-2.5 rounded-lg bg-white/5 border border-white/10 text-neutral-300 text-sm font-medium hover:bg-white/10 hover:text-white transition-colors"
                          >
                            {match.user.email}
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 animate-fade-in-up">
              <div className="mx-auto h-20 w-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                <Users className="h-10 w-10 text-zinc-600" />
              </div>
              <h3 className="text-xl font-bold text-zinc-100">No connections yet</h3>
              <p className="text-zinc-500 mt-2">Start discovering and liking profiles to make matches!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
