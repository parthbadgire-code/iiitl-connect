"use client";

import { useEffect, useState } from "react";
import { Search, PackageX, Package, Plus, CheckCircle2, Loader2, Calendar, Image as ImageIcon, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@parthbadgire/ui/components/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@parthbadgire/ui/components/dialog";
import { useSession } from "@/lib/auth-client";
import { uploadFileToR2 } from "@/lib/upload";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type LostFoundItem = {
  id: string;
  type: "LOST" | "FOUND";
  title: string;
  description: string;
  imageUrl?: string;
  isResolved: boolean;
  createdAt: string;
  reporter: { id: string; name: string; image?: string };
};

function SkeletonCard() {
  return (
    <Card className="bg-black/40 border border-white/5 rounded-3xl p-4">
      <div className="skeleton h-40 w-full rounded-xl mb-4" />
      <div className="skeleton h-5 w-2/3 rounded mb-2" />
      <div className="skeleton h-4 w-full rounded mb-1" />
      <div className="skeleton h-4 w-4/5 rounded" />
    </Card>
  );
}

export default function LostFoundPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "LOST" | "FOUND">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Compose
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ type: "LOST", title: "", description: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const url = activeFilter === "ALL"
        ? `${API}/lost-found`
        : `${API}/lost-found?type=${activeFilter}`;
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) setItems(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [activeFilter]); // eslint-disable-line

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    setIsSubmitting(true);
    try {
      let imageUrl = undefined;
      if (selectedFile) {
        imageUrl = await uploadFileToR2(selectedFile);
      }

      const res = await fetch(`${API}/lost-found`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          type: form.type,
          title: form.title,
          description: form.description,
          imageUrl,
        }),
      });
      if (res.ok) {
        setIsOpen(false);
        setForm({ type: "LOST", title: "", description: "" });
        setSelectedFile(null);
        fetchItems();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (id: string) => {
    await fetch(`${API}/lost-found/${id}/resolve`, { method: "PATCH", credentials: "include" });
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const filtered = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in-up">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1 w-6 rounded-full" style={{ background: "#f59e0b" }} />
            <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">Campus Board</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-white">
            Lost &amp; <span style={{ color: "#f59e0b" }}>Found</span>
          </h1>
          <p className="text-neutral-400 text-sm">Help your fellow students find what they&apos;re missing.</p>
        </div>

        {/* Post button */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105"
              style={{ background: "#f59e0b", color: "#000" }}>
              <Plus className="h-4 w-4" />
              Report Item
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg bg-[#0A0A0A] border border-neutral-800 rounded-3xl text-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Report a Lost or Found Item</DialogTitle>
              <DialogDescription className="text-neutral-400">
                Help reunite items with their owners.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Type selector */}
              <div className="flex gap-3">
                {["LOST", "FOUND"].map(t => (
                  <button
                    key={t}
                    onClick={() => setForm(f => ({ ...f, type: t }))}
                    className="flex-1 py-3 rounded-xl text-sm font-bold transition-all border"
                    style={{
                      background: form.type === t ? (t === "LOST" ? "#ef444420" : "#22c55e20") : "transparent",
                      color: form.type === t ? (t === "LOST" ? "#ef4444" : "#22c55e") : "#737373",
                      borderColor: form.type === t ? (t === "LOST" ? "#ef444440" : "#22c55e40") : "rgba(255,255,255,0.08)",
                    }}
                  >
                    {t === "LOST" ? "🔍 I Lost Something" : "📦 I Found Something"}
                  </button>
                ))}
              </div>

              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Item name (e.g. Blue Water Bottle)"
                className="w-full p-3.5 bg-black border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-amber-500/50 text-white"
              />

              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the item — color, brand, where lost/found, any distinctive features..."
                rows={3}
                className="w-full p-3.5 bg-black border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-amber-500/50 resize-none text-white"
              />

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Image (Optional)</label>
                {selectedFile ? (
                  <div className="relative h-32 w-full rounded-xl overflow-hidden border border-neutral-800">
                    <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-black transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 w-full bg-black border border-dashed border-neutral-800 rounded-xl cursor-pointer hover:border-amber-500/50 hover:bg-amber-500/5 transition-all">
                    <div className="h-10 w-10 rounded-full bg-neutral-900 flex items-center justify-center mb-2">
                      <ImageIcon className="h-5 w-5 text-neutral-500" />
                    </div>
                    <span className="text-sm font-medium text-neutral-400">Click to upload an image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => e.target.files && setSelectedFile(e.target.files[0])}
                    />
                  </label>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsOpen(false)} className="text-sm px-4 py-2 text-neutral-400 hover:text-white">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !form.title.trim() || !form.description.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-black disabled:opacity-40 transition-all"
                style={{ background: "#f59e0b" }}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "Posting..." : "Post Report"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter + Search bar */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up">
        <div className="flex p-1 bg-black/40 border border-white/5 rounded-xl">
          {(["ALL", "LOST", "FOUND"] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
              style={{
                background: activeFilter === f ? (f === "LOST" ? "#ef444420" : f === "FOUND" ? "#22c55e20" : "rgba(255,255,255,0.08)") : "transparent",
                color: activeFilter === f ? (f === "LOST" ? "#ef4444" : f === "FOUND" ? "#22c55e" : "#fff") : "#737373",
              }}
            >
              {f === "ALL" ? "All Items" : f === "LOST" ? "🔍 Lost" : "📦 Found"}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full h-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/5 rounded-xl text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/30 transition-colors"
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-fade-in-up">
        {[
          { label: "Total Reports", value: items.length, color: "#f59e0b" },
          { label: "Lost Items", value: items.filter(i => i.type === "LOST").length, color: "#ef4444" },
          { label: "Found Items", value: items.filter(i => i.type === "FOUND").length, color: "#22c55e" },
        ].map(stat => (
          <div key={stat.label} className="bg-black/40 border border-white/5 rounded-2xl p-4 text-center">
            <div className="text-3xl font-black" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs text-neutral-500 mt-1 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)
        ) : filtered.length > 0 ? (
          filtered.map((item, i) => {
            const isLost = item.type === "LOST";
            const isOwner = session?.user?.id === item.reporter.id;
            const timeStr = new Date(item.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric"
            });

            return (
              <Card
                key={item.id}
                className="bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden hover:border-white/15 transition-all duration-300 flex flex-col animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Type badge top strip */}
                <div className="h-1 w-full" style={{ background: isLost ? "#ef4444" : "#22c55e" }} />

                {/* Image (if any) */}
                {item.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover" />
                )}

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full"
                        style={{
                          background: isLost ? "#ef444415" : "#22c55e15",
                          color: isLost ? "#ef4444" : "#22c55e",
                          border: `1px solid ${isLost ? "#ef444430" : "#22c55e30"}`,
                        }}
                      >
                        {isLost ? "🔍 LOST" : "📦 FOUND"}
                      </span>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleResolve(item.id)}
                        className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 transition-all"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Resolved
                      </button>
                    )}
                  </div>
                  <CardTitle className="text-base font-bold text-white mt-2 leading-tight">{item.title}</CardTitle>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-between gap-4">
                  <CardDescription className="text-zinc-400 text-sm leading-relaxed line-clamp-3">
                    {item.description}
                  </CardDescription>

                  <div className="pt-3 border-t border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-neutral-800 flex items-center justify-center text-[9px] font-bold text-white overflow-hidden shrink-0">
                          {item.reporter.image
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={item.reporter.image} alt={item.reporter.name} className="w-full h-full object-cover" />
                            : item.reporter.name?.charAt(0) || "?"
                          }
                        </div>
                        <span className="text-xs text-neutral-500 truncate">{item.reporter.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-neutral-600">
                        <Calendar className="h-3 w-3" />
                        {timeStr}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-2xl flex items-center justify-center mb-6 animate-float"
              style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
              {activeFilter === "LOST" ? (
                <PackageX className="h-10 w-10" style={{ color: "#f59e0b" }} />
              ) : (
                <Package className="h-10 w-10" style={{ color: "#f59e0b" }} />
              )}
            </div>
            <p className="text-white font-semibold text-lg">No items reported</p>
            <p className="text-neutral-500 text-sm mt-1">
              {activeFilter === "LOST"
                ? "Nobody has reported a lost item yet."
                : activeFilter === "FOUND"
                  ? "Nobody has found an item yet."
                  : "Be the first to report a lost or found item!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
