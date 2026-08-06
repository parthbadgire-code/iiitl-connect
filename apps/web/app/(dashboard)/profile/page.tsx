"use client";

import { useEffect, useState } from "react";
import { Mail, GraduationCap, Github, Linkedin, Instagram, Sparkles, Plus, X, BadgeCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@parthbadgire/ui/components/card";

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
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8 animate-fade-in-up">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-1 w-6 rounded-full bg-pastel-lavender" />
          <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
            CampusOS
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white">
          User <span className="bg-gradient-to-r from-pastel-lavender to-pastel-blue bg-clip-text text-transparent">Profile</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: PUBLIC PREVIEW */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-[#0A0A0A]/50 backdrop-blur-xl border-white/5 overflow-hidden sticky top-8 shadow-2xl rounded-3xl">
            <div className="h-32 bg-pastel-lavender/10 border-b border-white/5 relative">
              <div className="absolute -bottom-12 left-6">
                <div className="h-24 w-24 rounded-full border-4 border-[#0A0A0A] bg-neutral-900 overflow-hidden shadow-xl">
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
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {profile.name}
                  {profile.role !== "STUDENT" && (
                    <BadgeCheck className="h-5 w-5 text-pastel-lavender" />
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
                <div className="pt-4 border-t border-white/5">
                  <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">Verified Positions</h3>
                  <div className="space-y-2">
                    {profile.clubMemberships.map((membership, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-pastel-lavender/10 p-2 rounded-xl border border-pastel-lavender/20">
                        <div className="h-8 w-8 rounded-lg bg-pastel-lavender/20 flex items-center justify-center border border-pastel-lavender/30">
                          <Sparkles className="h-4 w-4 text-pastel-lavender" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-pastel-lavender">{membership.role}</p>
                          <p className="text-[10px] text-neutral-400 font-medium">@ {membership.club.name}</p>
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
          <Card className="bg-[#0A0A0A]/50 backdrop-blur-xl border border-white/5 h-full rounded-3xl shadow-2xl">
            <CardHeader className="border-b border-white/5 pb-6">
              <CardTitle className="text-white">Edit Profile Information</CardTitle>
              <CardDescription className="text-neutral-400">
                Update your public identity. This information will be visible to other students in the Connections Hub and Academics section.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">Bio</label>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pastel-lavender transition-colors resize-none h-24"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">Graduation Batch</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                    <input
                      type="text"
                      value={batch}
                      onChange={e => setBatch(e.target.value)}
                      placeholder="e.g. 2026"
                      className="w-full pl-10 bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pastel-lavender transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">LinkedIn Profile</label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                    <input
                      type="text"
                      value={linkedin}
                      onChange={e => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full pl-10 bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pastel-lavender transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">GitHub Profile</label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                    <input
                      type="text"
                      value={github}
                      onChange={e => setGithub(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full pl-10 bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pastel-lavender transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-400 uppercase">Instagram Profile</label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
                    <input
                      type="text"
                      value={instagram}
                      onChange={e => setInstagram(e.target.value)}
                      placeholder="https://instagram.com/..."
                      className="w-full pl-10 bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pastel-lavender transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Manage Interests</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={e => setNewInterest(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddInterest()}
                    placeholder="e.g. Machine Learning, Calisthenics"
                    className="flex-1 bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pastel-lavender transition-colors"
                  />
                  <button type="button" onClick={handleAddInterest} className="px-6 rounded-xl font-bold bg-white/5 text-pastel-lavender hover:bg-pastel-lavender/10 border border-white/5 hover:border-pastel-lavender/30 transition-all">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {interests.map((interest, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-black border border-neutral-800 text-neutral-300 text-sm rounded-lg">
                      {interest}
                      <button onClick={() => handleRemoveInterest(interest)} className="text-neutral-500 hover:text-red-400 transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {interests.length === 0 && <span className="text-xs text-neutral-600">No interests added yet.</span>}
                </div>
              </div>

              <div className="pt-8 pb-2">
                <button 
                  onClick={handleSave} 
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-pastel-lavender text-black hover:bg-pastel-lavender/90 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? "Saving..." : "Save Profile"}
                </button>
              </div>

            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
