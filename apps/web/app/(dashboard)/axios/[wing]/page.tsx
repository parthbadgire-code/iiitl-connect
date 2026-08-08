/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@parthbadgire/ui/components/card";
import { Users, Calendar, BookOpen, Link as LinkIcon, Download, Upload } from "lucide-react";

type ClubDetails = {
  id: string;
  name: string;
  slug: string;
  description: string;
  members: any[];
  events: any[];
  resources: any[];
};

export default function AxiosWingPage() {
  const params = useParams();
  const slug = params?.wing as string;
  const [club, setClub] = useState<ClubDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PEOPLE" | "EVENTS" | "RESOURCES">("PEOPLE");

  useEffect(() => {
    if (slug) fetchWingDetails();
  }, [slug]);

  const fetchWingDetails = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/clubs`);
      if (res.ok) {
        const clubs = await res.json();
        const wing = clubs.find((c: { slug: string; id: string }) => c.slug === slug);
        if (wing) {
          const detailRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/clubs/${wing.id}`, { credentials: "include" });
          if (detailRes.ok) {
            setClub(await detailRes.json());
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-neutral-500">Loading Wing...</div>;
  if (!club) return <div className="flex justify-center items-center h-screen text-neutral-500">Wing not found.</div>;

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 overflow-y-auto w-full max-w-[1400px] mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1 w-6 rounded-full bg-pastel-lavender" />
            <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
              Axios Wing
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white">
            {club.name}
          </h1>
          <p className="text-neutral-400 max-w-2xl">{club.description}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[#0A0A0A]/50 backdrop-blur-xl border border-white/5 p-1.5 rounded-2xl w-fit">
        {[
          { id: "PEOPLE", icon: Users, label: "People" },
          { id: "EVENTS", icon: Calendar, label: "Events" },
          { id: "RESOURCES", icon: BookOpen, label: "Classes & Resources" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "PEOPLE" | "EVENTS" | "RESOURCES")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === tab.id 
                ? "bg-white/10 text-white shadow-lg" 
                : "text-neutral-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-8">
        {activeTab === "PEOPLE" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {club.members.map((member) => (
              <Card key={member.id} className="bg-[#0A0A0A]/50 backdrop-blur-xl border-white/5 shadow-2xl rounded-3xl p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-neutral-900 border border-neutral-800 shrink-0 flex items-center justify-center font-bold text-white">
                  {member.user.image ? <img src={member.user.image} alt="" className="h-full w-full object-cover" /> : member.user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-white font-bold">{member.user.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-pastel-lavender/10 text-pastel-lavender border border-pastel-lavender/20">
                    {member.role}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "RESOURCES" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Materials & Assignments</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-pastel-lavender text-black font-bold text-sm rounded-full hover:scale-105 transition-transform">
                <Upload className="h-4 w-4" /> Upload Resource
              </button>
            </div>
            {club.resources?.length === 0 ? (
              <div className="text-neutral-500 py-10 text-center border border-dashed border-white/10 rounded-3xl">No resources uploaded yet.</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {club.resources?.map((res) => (
                  <Card key={res.id} className="bg-[#0A0A0A]/50 backdrop-blur-xl border-white/5 shadow-2xl rounded-3xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-pastel-blue mb-1 block">{res.type}</span>
                        <h3 className="text-lg font-bold text-white">{res.title}</h3>
                      </div>
                      {res.url && (
                        <a href={res.url} target="_blank" rel="noreferrer" className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-pastel-lavender transition-colors">
                          <LinkIcon className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    {res.description && <p className="text-sm text-neutral-400 mb-4">{res.description}</p>}
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <div className="h-5 w-5 rounded-full bg-neutral-800 flex items-center justify-center overflow-hidden">
                        {res.uploader?.image ? <img src={res.uploader.image} alt="" className="h-full w-full object-cover" /> : <Users className="h-3 w-3" />}
                      </div>
                      Uploaded by {res.uploader?.name || "Unknown"}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "EVENTS" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {club.events?.length === 0 ? (
              <div className="text-neutral-500 py-10 text-center border border-dashed border-white/10 rounded-3xl col-span-2">No events scheduled.</div>
            ) : (
              club.events?.map((event) => (
                <Card key={event.id} className="bg-[#0A0A0A]/50 backdrop-blur-xl border-white/5 shadow-2xl rounded-3xl p-6">
                  <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                  <div className="space-y-1 text-sm text-neutral-400 mb-4">
                    <p>Date: {new Date(event.date).toLocaleDateString()}</p>
                    <p>Venue: {event.venue}</p>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
