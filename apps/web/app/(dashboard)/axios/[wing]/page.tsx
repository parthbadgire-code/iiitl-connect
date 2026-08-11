/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@parthbadgire/ui/components/card";
import { Users, Calendar, BookOpen, Link as LinkIcon, Upload, Star, Crown, X, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@parthbadgire/ui/components/dialog";
import { Button } from "@parthbadgire/ui/components/button";

type ClubDetails = {
  id: string;
  name: string;
  slug: string;
  description: string;
  members: any[];
  events: any[];
  resources: any[];
};

type WingMember = {
  name: string;
  role: "COORDINATOR" | "SENIOR_MEMBER";
};

// ─── Static member data from Axios roster ────────────────────────────────────
const AXIOS_MEMBERS: Record<string, WingMember[]> = {
  "axios-foss": [
    { name: "Shivansh Jain", role: "COORDINATOR" },
    { name: "Kinshuk", role: "COORDINATOR" },
    { name: "Aryan Singh", role: "SENIOR_MEMBER" },
    { name: "Naman Khandelwal", role: "SENIOR_MEMBER" },
    { name: "Merin Theres Jose", role: "SENIOR_MEMBER" },
    { name: "Anirudh Singh Rajora", role: "SENIOR_MEMBER" },
    { name: "Venella", role: "SENIOR_MEMBER" },
  ],
  "axios-cp": [
    { name: "Avinash Singh", role: "COORDINATOR" },
    { name: "Ayush Verma", role: "COORDINATOR" },
    { name: "Shreyansh Jain", role: "SENIOR_MEMBER" },
    { name: "Parth Vijay", role: "SENIOR_MEMBER" },
    { name: "Parteek Babbal", role: "SENIOR_MEMBER" },
    { name: "Md Anas Ali Usmani", role: "SENIOR_MEMBER" },
    { name: "Surendra", role: "SENIOR_MEMBER" },
    { name: "Aditya Chandak", role: "SENIOR_MEMBER" },
    { name: "Vansh Tomar", role: "SENIOR_MEMBER" },
  ],
  "axios-ml": [
    { name: "Vennela", role: "COORDINATOR" },
    { name: "Nischal Chandel", role: "COORDINATOR" },
    { name: "Rushil Dhingra", role: "SENIOR_MEMBER" },
    { name: "Arushi", role: "SENIOR_MEMBER" },
    { name: "Ravi Kumar", role: "SENIOR_MEMBER" },
    { name: "Sanjana", role: "SENIOR_MEMBER" },
  ],
  "axios-infosec": [
    { name: "Varun Baisane", role: "COORDINATOR" },
    { name: "Aaryan Dadu", role: "COORDINATOR" },
    { name: "Anirudh Singh Rajora", role: "SENIOR_MEMBER" },
    { name: "Jay Parashar", role: "SENIOR_MEMBER" },
    { name: "Soumaditya Masanta", role: "SENIOR_MEMBER" },
    { name: "Dhanush Annam", role: "SENIOR_MEMBER" },
  ],
  "axios-web": [
    { name: "Divyanshu Singh", role: "COORDINATOR" },
    { name: "Naman Khandelwal", role: "COORDINATOR" },
    { name: "Vedant Kulkarni", role: "SENIOR_MEMBER" },
    { name: "Vaidik Saxena", role: "SENIOR_MEMBER" },
    { name: "Arham Kachhara", role: "SENIOR_MEMBER" },
    { name: "Shivansh Jain", role: "SENIOR_MEMBER" },
    { name: "Shreyansh Patil", role: "SENIOR_MEMBER" },
  ],
  "axios-web3": [
    { name: "Sumanth", role: "COORDINATOR" },
    { name: "Rohan", role: "COORDINATOR" },
    { name: "Janmesh Shewale", role: "SENIOR_MEMBER" },
    { name: "Kaustubh Goge", role: "SENIOR_MEMBER" },
    { name: "Ishaan Bansal", role: "SENIOR_MEMBER" },
  ],
  "axios-design": [
    { name: "Manas Srivastava", role: "COORDINATOR" },
    { name: "Md Mozammil Ali", role: "COORDINATOR" },
    { name: "Diya Anna Varghese", role: "SENIOR_MEMBER" },
    { name: "Diksha Narayan", role: "SENIOR_MEMBER" },
    { name: "Khushi Singh", role: "SENIOR_MEMBER" },
    { name: "Hansika Reddy", role: "SENIOR_MEMBER" },
  ],
  "axios-app": [
    { name: "Sandesh Raj", role: "COORDINATOR" },
    { name: "Naman Gulati", role: "COORDINATOR" },
    { name: "Krishan", role: "SENIOR_MEMBER" },
    { name: "Insha", role: "SENIOR_MEMBER" },
    { name: "Prabnoor", role: "SENIOR_MEMBER" },
    { name: "Md Anas Ali Usmani", role: "SENIOR_MEMBER" },
  ],
};

const ROLE_CONFIG = {
  COORDINATOR: {
    label: "Coordinator",
    icon: Crown,
    badgeClass: "bg-pastel-lavender/10 text-pastel-lavender border-pastel-lavender/20",
    avatarClass: "from-pastel-lavender to-pastel-blue",
  },
  SENIOR_MEMBER: {
    label: "Senior Member",
    icon: Star,
    badgeClass: "bg-pastel-blue/10 text-pastel-blue border-pastel-blue/20",
    avatarClass: "from-pastel-blue to-pastel-mint",
  },
};

export default function AxiosWingPage() {
  const params = useParams();
  const slug = params?.wing as string;
  const [club, setClub] = useState<ClubDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PEOPLE" | "EVENTS" | "RESOURCES">("PEOPLE");

  // Modal State
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceDesc, setResourceDesc] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceType, setResourceType] = useState("DOCUMENT");
  const [isUploading, setIsUploading] = useState(false);

  // Schedule Class State
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classTitle, setClassTitle] = useState("");
  const [classDate, setClassDate] = useState("");
  const [classVenue, setClassVenue] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (slug) fetchWingDetails();
  }, [slug]);

  const fetchWingDetails = async () => {
    try {
      // Use the axios-wings endpoint which bypasses the filter
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/clubs/axios-wings`);
      if (res.ok) {
        const wings = await res.json();
        const wing = wings.find((c: { slug: string }) => c.slug === slug);
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

  const handleUploadResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!club) return;
    setIsUploading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/clubs/${club.id}/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: resourceTitle,
          description: resourceDesc,
          url: resourceUrl,
          type: resourceType,
        }),
      });
      if (res.ok) {
        setShowResourceModal(false);
        setResourceTitle("");
        setResourceDesc("");
        setResourceUrl("");
        fetchWingDetails();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to upload resource");
      }
    } catch (error) {
      console.error(error);
      alert("Error uploading resource.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleScheduleClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!club) return;
    setIsScheduling(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: classTitle,
          date: classDate,
          venue: classVenue,
          clubIds: [club.id],
        }),
      });
      if (res.ok) {
        setIsClassModalOpen(false);
        setClassTitle("");
        setClassDate("");
        setClassVenue("");
        fetchWingDetails();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to schedule class");
      }
    } catch (error) {
      console.error(error);
      alert("Error scheduling class.");
    } finally {
      setIsScheduling(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen text-neutral-500">Loading Wing...</div>;
  if (!club) return <div className="flex justify-center items-center h-screen text-neutral-500">Wing not found.</div>;

  const staticMembers = AXIOS_MEMBERS[slug] || [];
  const coordinators = staticMembers.filter(m => m.role === "COORDINATOR");
  const seniorMembers = staticMembers.filter(m => m.role === "SENIOR_MEMBER");

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
      <div className="mt-4">
        {activeTab === "PEOPLE" && (
          <div className="space-y-8">
            {/* Coordinators */}
            {coordinators.length > 0 && (
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
                  <Crown className="h-3.5 w-3.5 text-pastel-lavender" /> Coordinators
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coordinators.map((member, i) => {
                    const config = ROLE_CONFIG[member.role];
                    return (
                      <Card key={i} className="bg-[#0A0A0A]/50 backdrop-blur-xl border-white/5 border-pastel-lavender/10 shadow-2xl rounded-3xl p-5 flex items-center gap-4 hover:border-pastel-lavender/30 transition-colors">
                        <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${config.avatarClass} flex items-center justify-center font-black text-white text-lg shrink-0 shadow-lg`}>
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-white font-bold leading-tight">{member.name}</h3>
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border mt-1 font-bold uppercase tracking-wider ${config.badgeClass}`}>
                            <Crown className="h-2.5 w-2.5" />
                            {config.label}
                          </span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Senior Members */}
            {seniorMembers.length > 0 && (
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
                  <Star className="h-3.5 w-3.5 text-pastel-blue" /> Senior Members
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {seniorMembers.map((member, i) => {
                    const config = ROLE_CONFIG[member.role];
                    return (
                      <Card key={i} className="bg-[#0A0A0A]/50 backdrop-blur-xl border-white/5 shadow-2xl rounded-3xl p-5 flex items-center gap-4 hover:border-pastel-blue/20 transition-colors">
                        <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${config.avatarClass} flex items-center justify-center font-black text-white text-lg shrink-0 shadow-lg`}>
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-white font-bold leading-tight">{member.name}</h3>
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border mt-1 font-bold uppercase tracking-wider ${config.badgeClass}`}>
                            <Star className="h-2.5 w-2.5" />
                            {config.label}
                          </span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {staticMembers.length === 0 && (
              <div className="py-16 text-center border border-dashed border-white/10 rounded-3xl text-neutral-500">
                Member list coming soon.
              </div>
            )}
          </div>
        )}

        {activeTab === "RESOURCES" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Materials & Assignments</h2>
              <button 
                onClick={() => setShowResourceModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-pastel-lavender text-black font-bold text-sm rounded-full hover:scale-105 transition-transform"
              >
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
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Events & Classes</h2>
              <Dialog open={isClassModalOpen} onOpenChange={setIsClassModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-pastel-lavender hover:bg-pastel-lavender/90 text-black gap-2 font-bold px-4 rounded-full">
                    <Plus className="h-4 w-4" /> Schedule Class
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-black/60 backdrop-blur-xl border-white/10 text-white shadow-2xl">
                  <DialogHeader>
                    <DialogTitle>Schedule a Class / Event</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleScheduleClass} className="space-y-4 pt-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-400 uppercase">Title</label>
                      <input
                        required
                        value={classTitle}
                        onChange={e => setClassTitle(e.target.value)}
                        placeholder="e.g. Intro to React"
                        className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl text-sm focus:border-pastel-lavender outline-none text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-400 uppercase">Date & Time</label>
                      <input
                        required
                        type="datetime-local"
                        value={classDate}
                        onChange={e => setClassDate(e.target.value)}
                        className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl text-sm focus:border-pastel-lavender outline-none text-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-400 uppercase">Venue</label>
                      <input
                        required
                        value={classVenue}
                        onChange={e => setClassVenue(e.target.value)}
                        placeholder="e.g. LT-1"
                        className="w-full p-2.5 bg-black/50 border border-white/10 rounded-xl text-sm focus:border-pastel-lavender outline-none text-white"
                      />
                    </div>
                    <Button type="submit" disabled={isScheduling} className="w-full bg-pastel-lavender hover:bg-pastel-lavender/90 text-black mt-4 font-bold rounded-xl">
                      {isScheduling ? "Scheduling..." : "Schedule Class"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
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
          </div>
        )}
      </div>

      {/* Upload Resource Modal */}
      {showResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md bg-[#121212] border-white/10 shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-bold text-white">Upload Resource</h3>
              <button onClick={() => setShowResourceModal(false)} className="text-neutral-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUploadResource} className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Title</label>
                <input
                  required
                  type="text"
                  value={resourceTitle}
                  onChange={e => setResourceTitle(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-pastel-lavender"
                  placeholder="e.g. Week 1: Introduction"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Type</label>
                <select
                  value={resourceType}
                  onChange={e => setResourceType(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-pastel-lavender"
                >
                  <option value="DOCUMENT">Document</option>
                  <option value="VIDEO">Video</option>
                  <option value="LINK">Link</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase">URL / Link</label>
                <input
                  required
                  type="url"
                  value={resourceUrl}
                  onChange={e => setResourceUrl(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-pastel-lavender"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase">Description (Optional)</label>
                <textarea
                  value={resourceDesc}
                  onChange={e => setResourceDesc(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-pastel-lavender h-20 resize-none"
                  placeholder="Additional notes..."
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResourceModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-pastel-lavender text-black disabled:opacity-50"
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
