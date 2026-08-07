"use client";

import { useEffect, useState } from "react";
import { Mail, GraduationCap, Github, Linkedin, Instagram, Sparkles, BadgeCheck, Edit } from "lucide-react";
import { Card, CardContent } from "@parthbadgire/ui/components/card";
import Link from "next/link";

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

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/profile/me`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-zinc-500">Loading Profile...</div>;
  }

  if (!profile) return null;

  const { studentProfile } = profile;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
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
        <Link href="/settings" className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 bg-white/5 text-pastel-lavender hover:bg-pastel-lavender/10 border border-white/5 hover:border-pastel-lavender/30 hover:scale-105">
          <Edit className="h-4 w-4" />
          Edit Profile
        </Link>
      </div>

      <Card className="bg-[#0A0A0A]/50 backdrop-blur-xl border-white/5 overflow-hidden shadow-2xl rounded-3xl">
        <div className="h-48 bg-gradient-to-r from-pastel-lavender/10 to-pastel-blue/10 border-b border-white/5 relative">
          <div className="absolute -bottom-16 left-8 md:left-12">
            <div className="h-32 w-32 rounded-full border-4 border-[#0A0A0A] bg-neutral-900 overflow-hidden shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {profile.image ? (
                <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-zinc-500">
                  {profile.name?.charAt(0) || '?'}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <CardContent className="pt-20 pb-12 px-8 md:px-12 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
              {profile.name}
              {profile.role !== "STUDENT" && (
                <BadgeCheck className="h-6 w-6 text-pastel-lavender" />
              )}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Mail className="h-4 w-4" />
                {profile.email}
              </div>
              {studentProfile?.batch && (
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <GraduationCap className="h-4 w-4" />
                  Class of {studentProfile.batch}
                </div>
              )}
            </div>
          </div>

          {studentProfile?.bio && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                {studentProfile.bio}
              </p>
            </div>
          )}

          {/* Social Links */}
          <div className="flex flex-wrap items-center gap-3">
            {studentProfile?.githubUrl && (
              <a href={studentProfile.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors text-sm font-medium">
                <Github className="h-4 w-4" /> GitHub
              </a>
            )}
            {studentProfile?.linkedinUrl && (
              <a href={studentProfile.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-[#0a66c2] hover:border-[#0a66c2]/50 transition-colors text-sm font-medium">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
            )}
            {studentProfile?.instagramUrl && (
              <a href={studentProfile.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-[#e1306c] hover:border-[#e1306c]/50 transition-colors text-sm font-medium">
                <Instagram className="h-4 w-4" /> Instagram
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
            {/* Verified Club Badges */}
            {profile.clubMemberships && profile.clubMemberships.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Verified Positions</h3>
                <div className="space-y-3">
                  {profile.clubMemberships.map((membership, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-pastel-lavender/10 p-3 rounded-xl border border-pastel-lavender/20">
                      <div className="h-10 w-10 rounded-lg bg-pastel-lavender/20 flex items-center justify-center border border-pastel-lavender/30">
                        <Sparkles className="h-5 w-5 text-pastel-lavender" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-pastel-lavender">{membership.role}</p>
                        <p className="text-xs text-neutral-400 font-medium">@ {membership.club.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {studentProfile?.interests && studentProfile.interests.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {studentProfile.interests.map((interest, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-medium rounded-lg shadow-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

