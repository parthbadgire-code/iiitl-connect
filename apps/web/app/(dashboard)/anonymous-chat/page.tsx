"use client";

import { useEffect, useState } from "react";
import { Ghost, Sparkles, Filter, Send, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@parthbadgire/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@parthbadgire/ui/components/dialog";

type AnonymousPost = {
  id: string;
  content: string;
  category: string;
  createdAt: string;
  anonymousIdentity: {
    avatarSeed: string;
  };
};

const CATEGORIES = [
  { key: "CONFESSIONS", label: "Anonymous Chat", color: "#ec4899" },
  { key: "ACADEMICS", label: "Academics", color: "#7c3aed" },
  { key: "HOSTEL", label: "Hostel", color: "#f59e0b" },
  { key: "MEMES", label: "Memes", color: "#06b6d4" },
  { key: "PLACEMENTS", label: "Placements", color: "#10b981" },
];

function SkeletonPost() {
  return (
    <Card className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="skeleton h-5 w-1/3 rounded-lg" />
          <div className="skeleton h-4 w-16 rounded-full" />
        </div>
        <div className="skeleton h-3 w-1/4 rounded mt-1" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-5/6 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnonymousChatPage() {
  const [posts, setPosts] = useState<AnonymousPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("CONFESSIONS");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const url = activeCategory 
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/social/feed?category=${activeCategory}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/social/feed`;
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) setPosts(await res.json());
    } catch (err) {
      console.error("Failed to fetch feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const handleSubmit = async () => {
    if (!newContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/social/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newContent, category: newCategory }),
      });
      if (res.ok) {
        setIsComposeOpen(false);
        setNewContent("");
        fetchFeed(); // Refresh
      } else {
        alert("Failed to post confession.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 animate-fade-in-up">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1 w-6 rounded-full bg-pastel-mint" />
            <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
              Anonymous Feed
            </span>
          </div>
          <h1 className="text-3xl font-black text-white">Campus <span className="bg-gradient-to-r from-pastel-mint to-teal-400 bg-clip-text text-transparent">Anonymous Chat</span></h1>
          <p className="text-neutral-400 text-sm">Read what&apos;s on everyone&apos;s mind anonymously.</p>
        </div>

        {/* Compose Button */}
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <button className="group flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 bg-pastel-mint text-black hover:bg-pastel-mint/90 hover:scale-105">
              <Sparkles className="h-4 w-4" />
              New Post
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg bg-[#0A0A0A] border border-neutral-800 rounded-3xl text-white shadow-[0_0_50px_rgba(167,243,208,0.15)]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create Anonymous Post</DialogTitle>
              <DialogDescription className="text-neutral-400">
                You will be assigned a random moniker (e.g. &quot;Silent Ninja&quot;). No one will know it&apos;s you.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="What's happening on campus?"
                className="w-full h-32 p-4 bg-black border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-pastel-mint transition-colors resize-none"
              />
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.key}
                      onClick={() => setNewCategory(c.key)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        background: newCategory === c.key ? `${c.color}20` : "transparent",
                        color: newCategory === c.key ? c.color : "#8b8ba7",
                        border: newCategory === c.key ? `1px solid ${c.color}50` : "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsComposeOpen(false)} className="text-sm font-semibold px-4 py-2 text-neutral-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !newContent.trim()}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-pastel-mint hover:bg-pastel-mint/90"
              >
                {isSubmitting ? "Posting..." : "Post Anonymously"}
                {!isSubmitting && <Send className="w-4 h-4" />}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 animate-fade-in-up delay-100">
        <Filter className="h-4 w-4 mr-1 text-neutral-500" />
        <button
          onClick={() => setActiveCategory(null)}
          className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
          style={{
            background: activeCategory === null ? "rgba(255,255,255,0.1)" : "rgba(10,10,10,0.6)",
            color: activeCategory === null ? "#f4f4f8" : "#8b8ba7",
            border: activeCategory === null ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.05)",
          }}
        >
          All
        </button>
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: activeCategory === c.key ? `${c.color}20` : "rgba(10,10,10,0.6)",
              color: activeCategory === c.key ? c.color : "#8b8ba7",
              border: activeCategory === c.key ? `1px solid ${c.color}50` : "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {loading ? (
          <>
            <SkeletonPost />
            <SkeletonPost />
            <SkeletonPost />
          </>
        ) : posts.length > 0 ? (
          posts.map((post, i) => {
            const catConf = CATEGORIES.find(c => c.key === post.category) || CATEGORIES[0];
            const timeStr = new Date(post.createdAt).toLocaleDateString("en-IN", {
              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
            });
            
            return (
              <Card
                key={post.id}
                className="bg-[#0A0A0A]/50 backdrop-blur-xl border border-white/5 rounded-3xl animate-fade-in-up hover:border-white/20 transition-all duration-500"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ background: `${catConf.color}20`, color: catConf.color, border: `1px solid ${catConf.color}40` }}>
                        {post.anonymousIdentity.avatarSeed.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-base text-zinc-100 font-semibold">
                          {post.anonymousIdentity.avatarSeed}
                        </CardTitle>
                        <CardDescription className="text-xs text-zinc-500 mt-0.5">
                          {timeStr}
                        </CardDescription>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full shrink-0"
                      style={{ background: `${catConf.color}15`, color: catConf.color, border: `1px solid ${catConf.color}30` }}>
                      {catConf.label}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-zinc-800/50">
                    <button className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Reply
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4 animate-float bg-pastel-mint/10 border border-pastel-mint/20">
              <Ghost className="h-8 w-8 text-pastel-mint" />
            </div>
            <p className="text-white font-medium">No posts in this category yet</p>
            <p className="text-sm text-neutral-500 mt-1">Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
}
