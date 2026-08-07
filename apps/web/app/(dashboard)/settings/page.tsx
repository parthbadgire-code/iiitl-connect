"use client";

import { useEffect, useState } from "react";
import { GraduationCap, Github, Linkedin, Instagram, Plus, X, Settings as SettingsIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@parthbadgire/ui/components/card";

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
};

export default function SettingsPage() {
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
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/profile/me`, { credentials: "include" });
      if (res.ok) {
        const data: FullProfile = await res.json();
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
    setSuccessMsg("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/profile/me`, {
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
        setSuccessMsg("Profile updated successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-zinc-500">Loading Settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8 animate-fade-in-up">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-1 w-6 rounded-full bg-pastel-blue" />
          <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
            Account
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white flex items-center gap-4">
          <SettingsIcon className="h-10 w-10 text-pastel-blue" />
          <span className="bg-gradient-to-r from-pastel-blue to-pastel-mint bg-clip-text text-transparent">Settings</span>
        </h1>
      </div>

      <Card className="bg-[#0A0A0A]/50 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl">
        <CardHeader className="border-b border-white/5 pb-6">
          <CardTitle className="text-white">Profile Information</CardTitle>
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
                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pastel-blue transition-colors resize-none h-24"
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
                  className="w-full pl-10 bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pastel-blue transition-colors"
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
                  className="w-full pl-10 bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pastel-blue transition-colors"
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
                  className="w-full pl-10 bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pastel-blue transition-colors"
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
                  className="w-full pl-10 bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pastel-blue transition-colors"
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
                className="flex-1 bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pastel-blue transition-colors"
              />
              <button type="button" onClick={handleAddInterest} className="px-6 rounded-xl font-bold bg-white/5 text-pastel-blue hover:bg-pastel-blue/10 border border-white/5 hover:border-pastel-blue/30 transition-all">
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

          <div className="pt-8 pb-2 flex items-center gap-4">
            <button 
              onClick={handleSave} 
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-pastel-blue text-black hover:bg-pastel-blue/90 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? "Saving..." : "Save Profile"}
            </button>
            {successMsg && (
              <span className="text-sm font-semibold text-pastel-mint animate-in fade-in duration-300">
                {successMsg}
              </span>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
