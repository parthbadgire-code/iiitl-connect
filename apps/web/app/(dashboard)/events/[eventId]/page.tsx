"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Clock, Users, ArrowLeft, Image as ImageIcon, Loader2, Upload, ExternalLink } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { Button } from "@parthbadgire/ui/components/button";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { uploadFileToR2 } from "@/lib/upload";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@parthbadgire/ui/components/dialog";

interface EventGalleryPhoto {
  id: string;
  url: string;
  uploader: {
    name: string;
    image: string | null;
  };
  createdAt: string;
}

interface CampusEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  description: string;
  imageUrl?: string;
  externalLink?: string;
  clubs: { id: string; name: string; logo: string | null; slug: string }[];
  gallery: EventGalleryPhoto[];
  _count: { rsvps: number };
}

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const router = useRouter();

  const [event, setEvent] = useState<CampusEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newExternalLink, setNewExternalLink] = useState("");

  const { data: session } = useSession();
  const isAdmin = session?.user?.email === "lit2025021@iiitl.ac.in";

  useEffect(() => {
    if (eventId) fetchEventDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/events/${eventId}`, { credentials: "include" });
      if (res.ok) {
        setEvent(await res.json());
      } else {
        router.push("/events");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const fileUrl = await uploadFileToR2(selectedFile);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/events/${eventId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url: fileUrl }),
      });

      if (res.ok) {
        setIsUploadModalOpen(false);
        setSelectedFile(null);
        fetchEventDetails();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to upload photo. You might not have permission.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExternalLink) return;

    setIsAddingLink(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ externalLink: newExternalLink }),
      });

      if (res.ok) {
        setIsAddLinkModalOpen(false);
        setNewExternalLink("");
        fetchEventDetails();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to add link. You might not have permission.");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding link");
    } finally {
      setIsAddingLink(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading || !event) {
    return (
      <div className="flex h-screen items-center justify-center">
        <PremiumLoader />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8 animate-fade-in-up">
      <Link href="/events" className="inline-flex items-center text-sm text-neutral-400 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
      </Link>

      <div className="relative p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 w-64 h-64 bg-pastel-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {event.clubs.map(club => (
              <span key={club.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-pastel-blue/10 text-pastel-blue border border-pastel-blue/20">
                <Users className="h-3 w-3" /> {club.name}
              </span>
            ))}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">{event.title}</h1>
          
          <div className="flex flex-col md:flex-row md:items-center gap-6 mt-6">
            <div className="flex flex-col md:flex-row gap-6 text-neutral-300">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-pastel-mint/10 text-pastel-mint">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="font-medium">{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-pastel-peach/10 text-pastel-peach">
                  <MapPin className="h-5 w-5" />
                </div>
                <span className="font-medium">{event.venue}</span>
              </div>
            </div>
            
            {event.externalLink ? (
              <div className="md:ml-auto">
                <a 
                  href={event.externalLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-pastel-blue text-black px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(167,243,208,0.2)]"
                >
                  <ExternalLink className="h-4 w-4" />
                  Register Now
                </a>
              </div>
            ) : isAdmin && (
              <div className="md:ml-auto">
                <Dialog open={isAddLinkModalOpen} onOpenChange={setIsAddLinkModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2 bg-white/10 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-white/20 transition-colors border border-white/10">
                      <ExternalLink className="h-4 w-4" />
                      Add Link
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-[#0A0A0A] border-white/5 text-white">
                    <DialogHeader>
                      <DialogTitle>Add External Link</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddLink} className="space-y-4 pt-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Registration / External Link</label>
                        <input
                          required
                          value={newExternalLink}
                          onChange={e => setNewExternalLink(e.target.value)}
                          placeholder="e.g. https://unstop.com/..."
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:border-pastel-blue focus:bg-white/10 outline-none text-white transition-all placeholder:text-white/20"
                        />
                      </div>
                      <Button type="submit" disabled={isAddingLink || !newExternalLink} className="w-full bg-pastel-blue hover:bg-pastel-blue/90 text-black mt-4 font-bold">
                        {isAddingLink ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...
                          </>
                        ) : "Save Link"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="space-y-6 pt-8 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pastel-yellow/10 border border-pastel-yellow/20">
              <ImageIcon className="h-5 w-5 text-pastel-yellow" />
            </div>
            <h2 className="text-2xl font-bold text-white">Event Gallery</h2>
          </div>

          <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white/10 hover:bg-white/20 text-white gap-2 font-semibold">
                <Upload className="h-4 w-4" /> Upload Photo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[#0A0A0A] border-white/5 text-white">
              <DialogHeader>
                <DialogTitle>Upload Photo to Gallery</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUploadPhoto} className="space-y-4 pt-4">
                <div className="relative border-2 border-dashed border-neutral-800 rounded-xl p-8 flex flex-col items-center justify-center text-neutral-500 hover:border-pastel-blue hover:bg-pastel-blue/5 transition-colors cursor-pointer overflow-hidden group">
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  {selectedFile ? (
                    <div className="text-sm font-medium text-pastel-blue truncate max-w-full px-4 group-hover:scale-105 transition-transform">
                      {selectedFile.name}
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="h-10 w-10 mb-3 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">Click to upload an image</span>
                    </>
                  )}
                </div>
                <Button type="submit" disabled={isUploading || !selectedFile} className="w-full bg-pastel-blue hover:bg-pastel-blue/90 text-black mt-4 font-bold">
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading...
                    </>
                  ) : "Upload Photo"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {event.gallery && event.gallery.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[250px]">
            {event.gallery.map((photo, i) => {
              const isLarge = i % 5 === 0;
              const isWide = i % 5 === 1;
              const isTall = i % 5 === 2;
              
              let spanClass = "";
              if (isLarge) spanClass = "md:col-span-2 md:row-span-2";
              else if (isWide) spanClass = "md:col-span-2";
              else if (isTall) spanClass = "md:row-span-2";

              return (
                <motion.div 
                  key={photo.id} 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`group relative rounded-2xl overflow-hidden bg-neutral-900 border border-white/5 ${spanClass}`}
                >
                  <img 
                    src={photo.url} 
                    alt="Event photo" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-neutral-800 overflow-hidden border border-white/10 shrink-0">
                        {photo.uploader.image ? (
                          <img src={photo.uploader.image} alt="uploader" className="w-full h-full object-cover" />
                        ) : (
                          <Users className="h-3 w-3 m-1.5 text-neutral-400" />
                        )}
                      </div>
                      <span className="text-xs text-white/90 truncate">{photo.uploader.name}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center border border-dashed border-white/10 rounded-3xl">
            <ImageIcon className="h-12 w-12 text-neutral-600 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No photos yet</h3>
            <p className="text-neutral-400 text-sm max-w-sm">Be the first to upload a photo from this event to share with the community!</p>
          </div>
        )}
      </div>
    </div>
  );
}
