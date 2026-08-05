"use client";

import { useEffect, useState } from "react";
import { Mail, GraduationCap, Github, Linkedin, Instagram, Sparkles, Plus, X, BadgeCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@parthbadgire/ui/components/card";
import { Button } from "@parthbadgire/ui/components/button";

type ClubMembership = {
  club: {
    id: string;
    name: string;
    slug: string;
  };
  role: string;
};

type FullProfile = {
  id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  studentProfile: {
    bio: string;
    batch: string;
    linkedinUrl: string;
    instagramUrl: string;
    githubUrl: string;
    interests: string[];
  } | null;
  clubMemberships: ClubMembership[];
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [bio, setBio] = useState("");
  const [batch, setBatch] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [instagram, setInstagram] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/profile/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        if (data.studentProfile) {
          setBio(data.studentProfile.bio || "");
          setBatch(data.studentProfile.batch || "");
          setLinkedin(data.studentProfile.linkedinUrl || "");
          setGithub(data.studentProfile.githubUrl || "");
          setInstagram(data.studentProfile.instagramUrl || "");
          setInterests(data.studentProfile.interests || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInterest = () => {
    const val = newInterest.trim();
    if (val && !interests.includes(val)) {
      setInterests([...interests, val]);
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:3001/profile/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          bio,
          batch,
          linkedinUrl: linkedin,
          githubUrl: github,
          instagramUrl: instagram,
          interests,
        }),
      });
      if (res.ok) {
        fetchProfile(); // Refresh preview
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-zinc-500">Loading Profile...</div>;
  }

  if (!profile) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-1 w-6 rounded-full" style={{ background: "linear-gradient(90deg, #ec4899, #8b5cf6)" }} />
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#8b8ba7" }}>
            CampusOS
          </span>
        </div>
        <h1 className="text-4xl font-black text-zinc-100">
          User <span className="gradient-text-warm">Profile</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: PUBLIC PREVIEW */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="glass-card bg-zinc-950/80 border-zinc-800 overflow-hidden sticky top-8">
            <div className="h-32 bg-gradient-to-br from-pink-900/40 to-violet-900/40 border-b border-zinc-800 relative">
              <div className="absolute -bottom-12 left-6">
                <div className="h-24 w-24 rounded-full border-4 border-zinc-950 bg-zinc-800 overflow-hidden shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {profile.image ? (
                    <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-zinc-500">
                      {profile.name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <CardContent className="pt-16 pb-8 px-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
                  {profile.name}
                  {profile.role !== "STUDENT" && (
                    <BadgeCheck className="h-5 w-5 text-pink-500" />
                  )}
                </h2>
                <div className="flex items-center gap-2 mt-2 text-sm text-zinc-400">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </div>
                {batch && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-zinc-400">
                    <GraduationCap className="h-4 w-4" />
                    Class of {batch}
                  </div>
                )}
              </div>

              {bio && (
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {bio}
                </p>
              )}

              {/* Social Links */}
              <div className="flex items-center gap-3 pt-2">
                {github && (
                  <a href={github} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors">
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {linkedin && (
                  <a href={linkedin} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-[#0a66c2] hover:border-[#0a66c2]/50 transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {instagram && (
                  <a href={instagram} target="_blank" rel="noreferrer" className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-[#e1306c] hover:border-[#e1306c]/50 transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
              </div>

              {/* Verified Club Badges */}
              {profile.clubMemberships && profile.clubMemberships.length > 0 && (
                <div className="pt-4 border-t border-zinc-800/50">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Verified Positions</h3>
                  <div className="space-y-2">
                    {profile.clubMemberships.map((membership, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-gradient-to-r from-violet-900/20 to-transparent p-2 rounded-lg border border-violet-500/20">
                        <div className="h-8 w-8 rounded bg-violet-900/40 flex items-center justify-center border border-violet-500/30">
                          <Sparkles className="h-4 w-4 text-violet-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-violet-300">{membership.role}</p>
                          <p className="text-[10px] text-zinc-400 font-medium">@ {membership.club.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {interests.length > 0 && (
                <div className="pt-4 border-t border-zinc-800/50">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Interests</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {interests.map((interest, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs rounded-md">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: EDIT FORM */}
        <div className="lg:col-span-7">
          <Card className="bg-zinc-950 border-zinc-800 h-full">
            <CardHeader className="border-b border-zinc-800 pb-4">
              <CardTitle>Edit Profile Information</CardTitle>
              <CardDescription className="text-zinc-400">
                Update your public identity. This information will be visible to other students in the Connections Hub and Academics section.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase">Bio</label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-pink-500/50 resize-none h-24 text-zinc-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase">Graduation Batch</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      value={batch}
                      onChange={e => setBatch(e.target.value)}
                      placeholder="e.g. 2026"
                      className="w-full pl-9 p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-pink-500/50 text-zinc-100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase">LinkedIn Profile</label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      value={linkedin}
                      onChange={e => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full pl-9 p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-pink-500/50 text-zinc-100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase">GitHub Profile</label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      value={github}
                      onChange={e => setGithub(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full pl-9 p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-pink-500/50 text-zinc-100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase">Instagram Profile</label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      value={instagram}
                      onChange={e => setInstagram(e.target.value)}
                      placeholder="https://instagram.com/..."
                      className="w-full pl-9 p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-pink-500/50 text-zinc-100"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-800/50">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Manage Interests</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={e => setNewInterest(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddInterest()}
                    placeholder="e.g. Machine Learning, Calisthenics"
                    className="flex-1 p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:ring-2 focus:ring-pink-500/50 text-zinc-100"
                  />
                  <Button type="button" onClick={handleAddInterest} variant="secondary" className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {interests.map((interest, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm rounded-md">
                      {interest}
                      <button onClick={() => handleRemoveInterest(interest)} className="text-zinc-500 hover:text-red-400 transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {interests.length === 0 && <span className="text-xs text-zinc-600">No interests added yet.</span>}
                </div>
              </div>

              <div className="pt-8 pb-2">
                <Button 
                  onClick={handleSave} 
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 btn-shimmer"
                  style={{
                    background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
                    color: "#fff",
                    border: "1px solid rgba(236,72,153,0.4)",
                  }}
                >
                  {isSubmitting ? "Saving..." : "Save Profile"}
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
